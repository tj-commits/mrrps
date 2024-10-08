import { Prisma } from "@prisma/client";
import { inferAsyncReturnType } from "@trpc/server";
import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
  createTRPCContext,
} from "~/server/api/trpc";

export const mrrpRouter = createTRPCRouter({
  infiniteProfileFeed: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        limit: z.number().optional(),
        cursor: z.object({ id: z.string(), createdAt: z.date() }).optional(),
      })
    )
    .query(async ({ input: { limit = 10, userId, cursor }, ctx }) => {
      const currentUserId = ctx.session?.user.id;
      return await getInfiniteMrrps({
        limit,
        ctx,
        cursor,
        whereClause: { userId },
      });
    }),
  infiniteFeed: publicProcedure
    .input(
      z.object({
        onlyFollowing: z.boolean().optional(),
        limit: z.number().optional(),
        cursor: z.object({ id: z.string(), createdAt: z.date() }).optional(),
      })
    )
    .query(
      async ({ input: { limit = 10, onlyFollowing = false, cursor }, ctx }) => {
        const currentUserId = ctx.session?.user.id;
        return await getInfiniteMrrps({
          limit,
          ctx,
          cursor,
          whereClause:
            currentUserId == null || !onlyFollowing
              ? undefined
              : {
                  user: {
                    followers: { some: { id: currentUserId } },
                  },
                },
        });
      }
    ),
  infiniteSearchFeed: publicProcedure
    .input(
      z.object({
        search: z.string(),
        limit: z.number().optional(),
        cursor: z.object({ id: z.string(), createdAt: z.date() }).optional(),
      })
    )
    .query(async ({ input: { limit = 10, search, cursor }, ctx }) => {
      return await getInfiniteMrrps({
        limit,
        ctx,
        cursor,
        whereClause: { content: {
          contains: `${search} `,
          mode: 'insensitive'
        } },
      });
    }),
  create: protectedProcedure
    .input(z.object({ content: z.string(), image_url: z.string() }))
    .mutation(async ({ input: { content, image_url }, ctx }) => {
      const mrrp = await ctx.prisma.mrrp.create({
        data: { content, userId: ctx.session.user.id, image_url },
      });

      void ctx.revalidateSSG?.(`/profiles/${ctx.session.user.id}`);

      return mrrp;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input: { id }, ctx }) => {
      await ctx.prisma.mrrp.delete({
        where: { id },
      });

      void ctx.revalidateSSG?.(`/profiles/${ctx.session.user.id}`);

      return { deleted: true };
    }),
  toggleLike: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input: { id }, ctx }) => {
      const data = { mrrpId: id, userId: ctx.session.user.id };

      const existingLike = await ctx.prisma.like.findUnique({
        where: { userId_mrrpId: data },
      });

      if (existingLike == null) {
        await ctx.prisma.like.create({ data });
        return { addedLike: true };
      } else {
        await ctx.prisma.like.delete({ where: { userId_mrrpId: data } });
        return { addedLike: false };
      }
    }),
  
  /*search: protectedProcedure
    .input(z.object({ query: z.string() }))
    .query(async ({ input: { query }, ctx }) => {
      const result = await ctx.prisma.mrrp.findMany({
        where: {
          content: {
            search: query
          }
        }
      })
      return result
    })*/

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async({ input: { id }, ctx}) => {
      const currentUserId = ctx.session?.user.id
      const mrrp = await ctx.prisma.mrrp.findUnique({
        where: {
          id
        },
        select: {
          id: true,
      content: true,
      image_url: true,
      createdAt: true,
      _count: { select: { likes: true } },
      likes:
        currentUserId == null ? false : { where: { userId: currentUserId } },
      user: {
        select: { name: true, id: true, image: true },
      },
        }
      })
      if (mrrp == null || mrrp.id == null || mrrp.content == null || mrrp.image_url == null || mrrp.createdAt == null || mrrp._count == null || mrrp._count.likes == null || mrrp.user == null) return
      return {
        id: mrrp.id,
        content: mrrp.content,
        image_url: mrrp.image_url,
        createdAt: mrrp.createdAt,
        likeCount: mrrp._count.likes,
        user: mrrp.user,
        likedByMe: mrrp.likes?.length > 0
      }
    })
});

async function getInfiniteMrrps({
  whereClause,
  ctx,
  limit,
  cursor,
}: {
  whereClause?: Prisma.MrrpWhereInput;
  limit: number;
  cursor: { id: string; createdAt: Date } | undefined;
  ctx: inferAsyncReturnType<typeof createTRPCContext>;
}) {
  const currentUserId = ctx.session?.user.id;

  const data = await ctx.prisma.mrrp.findMany({
    take: limit + 1,
    cursor: cursor ? { createdAt_id: cursor } : undefined,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    where: whereClause,
    select: {
      id: true,
      content: true,
      image_url: true,
      createdAt: true,
      _count: { select: { likes: true } },
      likes:
        currentUserId == null ? false : { where: { userId: currentUserId } },
      user: {
        select: { name: true, id: true, image: true },
      },
      comments: true
    },
  });

  let nextCursor: typeof cursor | undefined;
  if (data.length > limit) {
    const nextItem = data.pop();
    if (nextItem != null) {
      nextCursor = { id: nextItem.id, createdAt: nextItem.createdAt };
    }
  }

  return {
    mrrps: data.map((mrrp) => {
      return {
        id: mrrp.id,
        content: mrrp.content,
        image_url: mrrp.image_url,
        createdAt: mrrp.createdAt,
        likeCount: mrrp._count.likes,
        user: mrrp.user,
        likedByMe: mrrp.likes?.length > 0,
        comments: mrrp.comments
      };
    }),
    nextCursor,
  };
}
