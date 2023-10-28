import Tobsdb, { PrimaryKey, Unique, Default } from "tobsdb";
import { env } from "@/env.mjs";

export type PostFlags = "beginner" | "login_required" | "desktop" | "mobile" | "urgent";

type DB = {
  user: {
    id: PrimaryKey<number>;
    name: Unique<string>;
    password: string;
    email?: Unique<string>;
    level: number;
    bio?: string;
    display_picture?: string;
    DOB?: Date;
    // user_id in post and reply table
    post_id: Unique<string>;
    created_at: Default<Date>;
  };

  post: {
    id: PrimaryKey<number>;
    user_id: string;
    title: string;
    content: string;
    flags?: PostFlags[];
    pictures?: string[];
    // post_id/parent_id in reply table
    reply_id: Unique<string>;
    created_at: Default<Date>;
  };

  reply: {
    id: PrimaryKey<number>;
    user_id: string;
    content: string;
    post_id: string;
    parent_id?: string;
    // could be a parent_id in reply table
    reply_id: Unique<string>;
    created_at: Default<Date>;
  };

  media: {
    id: PrimaryKey<number>;
    data: string;
    uid: Unique<string>;
  };
};

export const db = await Tobsdb.connect<DB>(
  env.TDB_HOST,
  env.TDB_TABLE,
  { auth: { username: env.TDB_USERNAME, password: env.TDB_PASSWORD } },
  { log: env.NODE_ENV === "development" }
);

process.prependOnceListener("SIGINT", () => db.disconnect());
