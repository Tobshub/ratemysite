import Tobsdb, { PrimaryKey, Unique } from "tobsdb";
import { env } from "@/env.mjs";

type DB = {
  user: {
    id: PrimaryKey<number>;
    name: Unique<string>;
    password: string;
    email: Unique<string>;
    level: number;
    DOB?: Date;
    post_id: Unique<string>;
    createdAt: Date;
  };

  post: {
    id: PrimaryKey<number>;
    user_id: string;
    title: string;
    content: string;
    pictures?: string[];
    reply_id: Unique<string>;
    createdAt: Date;
  };

  reply: {
    id: PrimaryKey<number>;
    user_id: string;
    contend: string;
    post_id?: string;
    reply_id?: string;
    createdAt: Date;
  };
};

export const db = await Tobsdb.connect<DB>(env.TDB_HOST, env.TDB_TABLE, {
  auth: { username: env.TDB_USERNAME, password: env.TDB_PASSWORD },
});
