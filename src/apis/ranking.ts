const API_BASE_URL = 'https://port-0-catch-the-fly-back-m3dtig8o219ced49.sel4.cloudtype.app/api';

export interface RankingData {
  rank: number;
  username: string;
  time: number;
}

export const saveGameTime = async (username: string, time: number, difficulty: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/save-time`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, time, difficulty }),
    });
    
    if (!response.ok) throw new Error('Failed to save time');
    return await response.json();
  } catch (error) {
    console.error('Error saving time:', error);
    throw error;
  }
};

export const getRankings = async (difficulty: string): Promise<RankingData[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/rankings?difficulty=${difficulty}`);
    if (!response.ok) throw new Error('Failed to fetch rankings');
    const data = await response.json();
    return data.rankings;
  } catch (error) {
    console.error('Error fetching rankings:', error);
    return [];
  }
}; 