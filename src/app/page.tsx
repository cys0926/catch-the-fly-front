'use client';

import { useState } from 'react';

export default function Home() {
  const [username, setUsername] = useState('');
  const [difficulty, setDifficulty] = useState('easy');

  const handleStart = () => {
    if (!username.trim()) {
      alert('이름을 입력해주세요!');
      return;
    }
    const params = new URLSearchParams({
      username: username,
      difficulty: difficulty
    });
    window.location.href = `/game?${params.toString()}`;
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold mb-8">파리잡기 게임 🪰</h1>
      
      <div className="max-w-md w-full space-y-6 bg-white p-8 rounded-lg shadow-md">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">게임 설명</h2>
          <p className="text-gray-600">
            화면에 나타나는 파리를 모두 잡아보세요! 
            난이도에 따라 파리의 속도가 달라집니다.
            가장 빠른 시간 안에 모든 파리를 잡으면 승리!
          </p>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">
            이름
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            placeholder="이름을 입력하세요"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">
            난이도
          </label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
          >
            <option value="easy">쉬움</option>
            <option value="medium">보통</option>
            <option value="hard">어려움</option>
          </select>
        </div>

        <button
          onClick={handleStart}
          className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition-colors"
        >
          게임 시작
        </button>
      </div>
    </div>
  );
}
