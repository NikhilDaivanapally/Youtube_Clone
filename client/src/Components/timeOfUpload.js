const uploadedAt = (utc) => {
  const currentUTC = new Date();
  const uploadDate = new Date(utc);

  const yearsDiff = currentUTC.getFullYear() - uploadDate.getFullYear();
  const monthsDiff = currentUTC.getMonth() - uploadDate.getMonth();
  const daysDiff = currentUTC.getDate() - uploadDate.getDate();
  const hoursDiff = currentUTC.getHours() - uploadDate.getHours();
  const minutesDiff = currentUTC.getMinutes() - uploadDate.getMinutes();

  if (yearsDiff > 0) {
    return yearsDiff === 1 ? "1 year ago" : `${yearsDiff} years ago`;
  }
  if (monthsDiff > 0) {
    return monthsDiff === 1 ? "1 month ago" : `${monthsDiff} months ago`;
  }
  if (daysDiff > 0) {
    return daysDiff === 1 ? "1 day ago" : `${daysDiff} days ago`;
  }
  if (hoursDiff > 0) {
    return hoursDiff === 1 ? "1 hour ago" : `${hoursDiff} hours ago`;
  }
  if (minutesDiff > 0) {
    return minutesDiff === 1 ? "1 minute ago" : `${minutesDiff} minutes ago`;
  }

  return "Just now";
};

export default uploadedAt