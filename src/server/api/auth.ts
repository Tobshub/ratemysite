import jwt from "jsonwebtoken";
import b from "bcrypt";
import { env } from "@/env.mjs";

export const AppToken = {
  generate(data: string) {
    return jwt.sign(data, env.JWT_SECRET);
  },
  validate(token: string) {
    return jwt.verify(token, env.JWT_SECRET) as string;
  },
};

export const Encrypt = {
  hash: (value: string) => {
    return b.hashSync(value, 10);
  },
  compare: (plain: string, hashed: string) => {
    return b.compareSync(plain, hashed);
  },
};
