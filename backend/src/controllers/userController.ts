import { Response, Request } from "express";

const getUsers = async (req: Request, res: Response) => {
  return res.send("Hola mundo!");
};

export { getUsers };
