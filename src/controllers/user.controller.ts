import { Users } from "../models/data.model";

export const getUser = (req: any, res: any) => {
  const userId = req.params.userId;
  const user = Users.find((ele) => ele.id === userId);

  if (!user) {
    res.status(401).send("User not found");
    return;
  }

  res.json({
    balances: user.balance,
  });
};
