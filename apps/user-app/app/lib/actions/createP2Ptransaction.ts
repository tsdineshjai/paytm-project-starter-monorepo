"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "../auth";
import prisma from "@repo/db/client";

export async function p2pTransfer(to: string, transferAmount: number) {
	const session = await getServerSession(authOptions);
	const from = session?.user?.id;

	if (!from) {
		return {
			message: "Error while sending",
		};
	}

	//finding the user to whom we gonna make a transfer
	const toUser = await prisma.user.findFirst({
		where: {
			number: to,
		},
	});

	if (!toUser) {
		return {
			message: "user not found",
		};
	}

	await prisma.$transaction(async (tx) => {
		//this makes the userId gets locked until the transaction is complete
		await tx.$queryRaw`SELECT * FROM "Balance" WHERE "userId" = ${Number(from)} FOR UPDATE`;
		const fromBalance = await tx.balance.findUnique({
			where: {
				userId: Number(from),
			},
		});

		if (!fromBalance || fromBalance.amount < transferAmount) {
			throw new Error("Insufficient funds");
		}

		//deduct the money from the person who makes the transfer
		await tx.balance.update({
			where: {
				userId: Number(from),
			},
			data: {
				amount: {
					decrement: transferAmount,
				},
			},
		});

		//increment to the user balance who receieves the money
		await tx.balance.update({
			where: {
				userId: toUser.id,
			},
			data: {
				amount: {
					increment: transferAmount,
				},
			},
		});

		await tx.p2pTransfer.create({
			data: {
				fromUserId: Number(from),
				toUserId: toUser.id,
				amount: transferAmount,
				timestamp: new Date(),
			},
		});
	});
}
