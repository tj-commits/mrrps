import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
  createTRPCContext,
} from "~/server/api/trpc";
import { api } from "~/utils/api";

export const commentRouter = createTRPCRouter({
  infiniteFeed: publicProcedure
    .input(
      z.object({
        mrrpId: z.string()
      })
    )
    .query(
      async ({ input: { mrrpId }, ctx }) => {
        const mrrp = await ctx.prisma.mrrp.findUnique({
          where: { id: mrrpId },
          select: {
            comments: true
          },
        })
        if (mrrp == null) return
        return mrrp.comments
      }
    ),
  create: protectedProcedure
    .input(z.object({ body: z.string(), mrrpId: z.string() }))
    .mutation(async ({ input: { body, mrrpId }, ctx }) => {
      const comment = await ctx.prisma.comment.create({
        data: { body, userId: ctx.session.user.id, mrrpId: mrrpId },
      });

      void ctx.revalidateSSG?.(`/profiles/${ctx.session.user.id}`);

      return comment;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input: { id }, ctx }) => {
      await ctx.prisma.comment.delete({
        where: { id },
      });

      void ctx.revalidateSSG?.(`/profiles/${ctx.session.user.id}`);

      return { deleted: true };
    }),
  toggleLike: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input: { id }, ctx }) => {
      const data = { commentId: id, userId: ctx.session.user.id };

      const existingLike = await ctx.prisma.commentLike.findUnique({
        where: { userId_commentId: data },
      });

      if (existingLike == null) {
        await ctx.prisma.commentLike.create({ data });
        return { addedLike: true };
      } else {
        await ctx.prisma.commentLike.delete({ where: { userId_commentId: data } });
        return { addedLike: false };
      }
    }),
  
});

async function getProfileById(id: string, ctx: any) {
  const currentUserId = ctx.session?.user.id;
      const profile = await ctx.prisma.user.findUnique({
        where: { id },
        select: {
          name: true,
          image: true,
          _count: { select: { followers: true, follows: true, mrrps: true } },
          followers:
            currentUserId == null
              ? undefined
              : { where: { id: currentUserId } }
        },
      });

      if (profile == null) return;

      return {
        name: profile.name,
        image: profile.image,
        followersCount: profile._count.followers,
        followsCount: profile._count.follows,
        mrrpsCount: profile._count.mrrps,
        isFollowing: profile.followers.length > 0
      };
}