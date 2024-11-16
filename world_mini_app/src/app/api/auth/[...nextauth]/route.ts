import NextAuth from "next-auth";

// For more information on each option (and a full list of options) go to
// https://next-auth.js.org/configuration/options
export const handler = NextAuth({
  // https://next-auth.js.org/configuration/providers/oauth
  providers: [
    {
      id: "worldcoin",
      name: "Worldcoin",
      type: "oauth",
      wellKnown: "https://id.worldcoin.org/.well-known/openid-configuration",
      authorization: { params: { scope: "openid profile" } },
      clientId: process.env.NEXT_PUBLIC_WLD_MINI_APP_ID,
      clientSecret: process.env.WLD_CLIENT_SECRET,
      idToken: true,
      checks: ["state", "nonce", "pkce"],
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.sub,
          verificationLevel:
            profile["https://id.worldcoin.org/v1"].verification_level,
        };
      },
    },
  ],
  callbacks: {
    async signIn(params) {
      console.log("signIn", params);
      return true;
    },
    async jwt({ token }) {
      return token;
    },
  },
  debug: true,
});

// export default NextAuth(authOptions);
export { handler as GET, handler as POST };
