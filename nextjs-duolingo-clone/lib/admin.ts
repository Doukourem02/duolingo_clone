import { auth } from "@clerk/nextjs"

const adminIds = [
  "user_2dGb6YEarBAQHrNYoB5dMtISRWK",
  "user_3HQpNYMjRbLIF1DnecI3kjf33LA",
];

export const isAdmin = () => {
  const { userId } = auth();

  if (!userId) {
    return false;
  }

  return adminIds.indexOf(userId) !== -1;
};
