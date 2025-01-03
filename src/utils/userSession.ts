export const getUserId = (): string => {
    let userId = localStorage?.getItem('chat_user_id');
  
    if (!userId) {
      // userId = `user_${Math.random().toString(36).substr(2, 9)}`;
      userId = 'user1';
      localStorage.setItem('chat_user_id', userId);
    }
  
    return userId;
  };
  