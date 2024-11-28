// frontend/src/utils/timeUtils.js
// Funciones para formatear y parsear tiempos

export const formatTimeToDisplay = (timeInSeconds) => {
  const hours = Math.floor(timeInSeconds / 3600);
  const minutes = Math.floor((timeInSeconds % 3600) / 60);
  const seconds = Math.floor(timeInSeconds % 60);
  const milliseconds = Math.round((timeInSeconds % 1) * 1000);

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')},${String(milliseconds).padStart(3, '0')}`;
};

export const parseTimeToSeconds = (timeString) => {
  try {
      const [time, milliseconds] = timeString.split(',');
      const [hours, minutes, seconds] = time.split(':').map(Number);
      return hours * 3600 + minutes * 60 + seconds + Number(milliseconds) / 1000;
      
  // eslint-disable-next-line no-unused-vars
  } catch (error) {
      return null;
  }
};

export const validateTimeFormat = (timeString) => /^\d{2}:\d{2}:\d{2},\d{3}$/.test(timeString);

// Additional utility function for formatting time display
export const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};