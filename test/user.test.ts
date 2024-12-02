import { describe, it, expect, beforeAll, vi } from "vitest";
import request from "supertest";
import { app } from "../src";
import { prisma } from "../__mocks__/db";
import bcrypt from "bcrypt";

vi.mock("../db");

describe("/POST register", () => {
  //   beforeAll(async () => {
  //     await prisma.user.deleteMany();
  //   });

  it("should get message user created and success code 200", async () => {
    prisma.user.create.mockResolvedValue({
      id: "1",
      username: "shiv",
      email: "shivneeraj2004@gmail.com",
      password: "123456",
    });

    const response = await request(app).post("/api/v1/register").send({
      username: "shiv",
      email: "shivneeraj2004@gmail.com",
      password: "123456",
    });
    expect(response.body.message).toBe("user created successfully");
    expect(response.statusCode).toBe(200);
    expect(response.body.data).toBe("shiv");
  });
  it("should get message incorrect input when and status code 411", async () => {
    const response = await request(app).post("/api/v1/register").send({
      username: "shiv",
      email: "shivneeraj2004@gmail.com",
      password: "12345",
    });
    expect(response.body.message).toBe("incorrect input");
    expect(response.statusCode).toBe(411);
  });
});

describe("/POST login", () => {
  it("should return with statuscode of 404 and message success", async () => {
    const res = await request(app).post("/api/v1/login").send({
      email: "testuseremail@gmail.com",
      password: "12345678",
    });
    expect(res.status).toBe(404);
    expect(res.body.message).toBe("user not registered");
  });
  it("should return with statuscode of 200 and message success", async () => {
    const hashPass = await bcrypt.hash("123456", 12);
    prisma.user.findUnique.mockResolvedValue({
      id: "1",
      username: "shiv",
      email: "shivneeraj2004@gmail.com",
      password: hashPass,
    });
    const res = await request(app).post("/api/v1/login").send({
      email: "shivneeraj2004@gmail.com",
      password: "123456",
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("success");
  });
  it("should return with statuscode of 411 and message incorrect input", async () => {
    const res = await request(app).post("/api/v1/login").send({
      email: "shivneeraj2004@gmail.com",
      password: "12345",
    });
    expect(res.statusCode).toBe(411);
    expect(res.body.message).toBe("incorrect input");
  });
  it("should return with statuscode of 403 and message failed", async () => {
    const res = await request(app).post("/api/v1/login").send({
      email: "shivneeraj2004@gmail.com",
      password: "1234867",
    });
    expect(res.statusCode).toBe(401);
    expect(res.body.status).toBe("failed");
  });
});
