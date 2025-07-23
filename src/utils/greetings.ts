export const getTimeBasedGreeting = (name?: string): string => {
  const hour = new Date().getHours();
  let greeting: string;

  if (hour >= 5 && hour < 12) {
    greeting = 'Good morning';
  } else if (hour >= 12 && hour < 17) {
    greeting = 'Good afternoon';
  } else if (hour >= 17 && hour < 21) {
    greeting = 'Good evening';
  } else {
    greeting = 'Good night';
  }

  return name ? `${greeting}, ${name}!` : greeting;
};

export const getTimeBasedWelcome = (name?: string): string => {
  const hour = new Date().getHours();
  let timeContext: string;

  if (hour >= 5 && hour < 12) {
    timeContext = 'morning';
  } else if (hour >= 12 && hour < 17) {
    timeContext = 'afternoon';
  } else if (hour >= 17 && hour < 21) {
    timeContext = 'evening';
  } else {
    timeContext = 'night';
  }

  return name 
    ? `Welcome ${name}! Your account has been created successfully. Have a great ${timeContext}!`
    : `Welcome! Your account has been created successfully. Have a great ${timeContext}!`;
}; 