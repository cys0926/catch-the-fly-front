'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { saveGameTime, getRankings, RankingData } from '@/apis/ranking';
import { Suspense } from 'react';

function GameContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const username = searchParams.get('username');
  const difficulty = searchParams.get('difficulty');

  const [isPlaying, setIsPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [flies, setFlies] = useState<{ id: number; x: number; y: number }[]>([]);
  const [gameComplete, setGameComplete] = useState(false);
  const [rankings, setRankings] = useState<RankingData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // GAME_CONFIG를 useMemo로 최적화
  const GAME_CONFIG = {
    easy: { flyCount: 5, speedMultiplier: 0.7 },
    medium: { flyCount: 8, speedMultiplier: 1 },
    hard: { flyCount: 12, speedMultiplier: 1.5 },
  };

  // fetchRankings를 useCallback으로 메모이제이션
  const fetchRankings = useCallback(async () => {
    if (!difficulty) return;
    const data = await getRankings(difficulty);
    setRankings(data);
  }, [difficulty]);

  // 게임 시작
  const startGame = () => {
    setIsPlaying(true);
    setTime(0);
    generateFlies();
  };

  // 파리 생성
  const generateFlies = () => {
    const config = GAME_CONFIG[difficulty as keyof typeof GAME_CONFIG];
    const newFlies = Array.from({ length: config.flyCount }, (_, i) => ({
      id: i,
      x: Math.random() * 80, // 화면 범위 내에서 랜덤 위치
      y: Math.random() * 80,
    }));
    setFlies(newFlies);
  };

  // 파리 잡기
  const catchFly = (flyId: number) => {
    setFlies(prev => prev.filter(fly => fly.id !== flyId));
  };

  // 타이머
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && !gameComplete) {
      interval = setInterval(() => {
        setTime(prev => prev + 0.1);
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying, gameComplete]);

  // 파리 움직임 로직을 수정
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();
    const config = GAME_CONFIG[difficulty as keyof typeof GAME_CONFIG];
    
    // 각 파리의 이동 방향과 속도를 저장
    const flyDirections = flies.map(() => ({
      dx: (Math.random() - 0.5) * 0.05,  // x축 이동 속도
      dy: (Math.random() - 0.5) * 0.05   // y축 이동 속도
    }));

    const animate = (currentTime: number) => {
      if (!isPlaying || gameComplete) return;

      const deltaTime = currentTime - lastTime;
      
      if (deltaTime > 16) {  // 약 60fps로 제한
        setFlies(prev => prev.map((fly, index) => {
          // 새로운 위치 계산
          let newX = fly.x + flyDirections[index].dx * deltaTime * config.speedMultiplier;
          let newY = fly.y + flyDirections[index].dy * deltaTime * config.speedMultiplier;

          // 화면 경계에 부딪히면 방향 전환
          if (newX <= 0 || newX >= 80) {
            flyDirections[index].dx *= -1;
            newX = Math.max(0, Math.min(80, newX));
          }
          if (newY <= 0 || newY >= 80) {
            flyDirections[index].dy *= -1;
            newY = Math.max(0, Math.min(80, newY));
          }

          // 가끔 방향 랜덤 변경 (자연스러운 움직임을 위해)
          if (Math.random() < 0.01) {
            flyDirections[index].dx = (Math.random() - 0.5) * 0.05;
            flyDirections[index].dy = (Math.random() - 0.5) * 0.05;
          }

          return {
            ...fly,
            x: newX,
            y: newY
          };
        }));
        
        lastTime = currentTime;
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    if (isPlaying && !gameComplete) {
      animationFrameId = requestAnimationFrame(animate);
    }

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isPlaying, difficulty, gameComplete, flies, GAME_CONFIG]);

  useEffect(() => {
    fetchRankings();
  }, [fetchRankings]);

  useEffect(() => {
    if (isPlaying && flies.length === 0) {
      setGameComplete(true);
      setIsPlaying(false);
      
      if (username && difficulty) {
        setIsLoading(true);
        saveGameTime(username, parseFloat(time.toFixed(1)), difficulty)
          .then(() => fetchRankings())
          .finally(() => setIsLoading(false));
      }
    }
  }, [flies, isPlaying, username, difficulty, time, fetchRankings]);

  if (!username || !difficulty) {
    router.push('/');
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white p-4 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <div>
            <span className="font-bold">플레이어: </span>
            <span>{username}</span>
          </div>
          <div>
            <span className="font-bold">시간: </span>
            <span>{time.toFixed(1)}초</span>
          </div>
          <div>
            <span className="font-bold">남은 파리: </span>
            <span>{flies.length}마리</span>
          </div>
        </div>

        {!isPlaying && !gameComplete && (
          <button
            onClick={startGame}
            className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition-colors mb-4"
          >
            게임 시작
          </button>
        )}

        <div className="flex gap-4">
          {/* 게임 영역 */}
          <div className="flex-1">
            <div className="relative w-full h-[600px] bg-gray-100 rounded-lg overflow-hidden">
              {flies.map(fly => (
                <button
                  key={fly.id}
                  onClick={() => catchFly(fly.id)}
                  className="absolute w-8 h-8 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                  style={{ left: `${fly.x}%`, top: `${fly.y}%` }}
                >
                  🪰
                </button>
              ))}
            </div>
          </div>

          {/* 랭킹 영역 */}
          <div className="w-80 bg-gray-50 p-4 rounded-lg">
            <h3 className="text-xl font-bold mb-4">
              {difficulty === 'easy' && '쉬움'}
              {difficulty === 'medium' && '보통'}
              {difficulty === 'hard' && '어려움'}
              {' '}난이도 랭킹
            </h3>
            {isLoading ? (
              <div className="text-center py-4">로딩 중...</div>
            ) : (
              <div className="space-y-2">
                {rankings.map((rank, index) => (
                  <div
                    key={index}
                    className={`flex justify-between items-center p-2 rounded ${
                      rank.username === username ? 'bg-blue-100' : 'bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-bold w-6">{rank.rank}</span>
                      <span>{rank.username}</span>
                    </div>
                    <span>{rank.time.toFixed(1)}초</span>
                  </div>
                ))}
                {rankings.length === 0 && (
                  <div className="text-center text-gray-500 py-4">
                    아직 기록이 없습니다
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {gameComplete && (
          <div className="mt-4 text-center">
            <h2 className="text-2xl font-bold mb-2">게임 종료!</h2>
            <p className="text-xl mb-4">기록: {time.toFixed(1)}초</p>
            <button
              onClick={() => router.push('/')}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
            >
              홈으로 돌아가기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// 메인 페이지 컴포넌트
export default function GamePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <GameContent />
    </Suspense>
  );
} 