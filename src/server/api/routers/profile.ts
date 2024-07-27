import { Prisma } from "@prisma/client";
import { inferAsyncReturnType } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";

export const profileRouter = createTRPCRouter({
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input: { id }, ctx }) => {
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
              : { where: { id: currentUserId } },
        },
      });

      if (profile == null) return;

      return {
        name: profile.name,
        image: profile.image,
        followersCount: profile._count.followers,
        followsCount: profile._count.follows,
        mrrpsCount: profile._count.mrrps,
        isFollowing: profile.followers.length > 0,
      };
    }),
  toggleFollow: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ input: { userId }, ctx }) => {
      const currentUserId = ctx.session.user.id;

      const existingFollow = await ctx.prisma.user.findFirst({
        where: { id: userId, followers: { some: { id: currentUserId } } },
      });

      let addedFollow;
      if (existingFollow == null) {
        await ctx.prisma.user.update({
          where: { id: userId },
          data: { followers: { connect: { id: currentUserId } } },
        });
        addedFollow = true;
      } else {
        await ctx.prisma.user.update({
          where: { id: userId },
          data: { followers: { disconnect: { id: currentUserId } } },
        });
        addedFollow = false;
      }
      // Revalidation
      void ctx.revalidateSSG?.(`/profiles/${userId}`);
      void ctx.revalidateSSG?.(`/profiles/${currentUserId}`);

      // Return addedoflow
      return { addedFollow };
    })
});

function a() {
  
}

/*function getSelectedRandomProfiles(
  howManyProfilesToGet: number,
  profiles: any
) {
  const selectedProfiles = [];
  for (let i = 0; i < howManyProfilesToGet; i++) {
    let selectedProfile;
    for (let j = 0; j < profiles.length; j++) {
      const profile = profiles[j];
      const chance = true;
      const ifThisIsNullThenContinue = selectedProfiles.find(p => p === profile)
      if (ifThisIsNullThenContinue == null) {
        continue
      }
      const isSelectedProfile = chance;
      if (isSelectedProfile) {
        selectedProfile = profile;
        break;
      }
    }
    selectedProfiles.push(selectedProfile);
  }
  return selectedProfiles;
}
*/
