import { Amplify } from "aws-amplify";

export const amplifyCognitoConfig = Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: String(process.env.AWS_COGNITO_POOL_ID),
      userPoolClientId: String(process.env.AWS_COGNITO_APP_CLIENT_ID),
      identityPoolId: "",
      loginWith: {
        email: true,
      },
      signUpVerificationMethod: "code",
      userAttributes: {
        email: {
          required: true,
        },
      },
      allowGuestAccess: true,
      passwordFormat: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireNumbers: true,
        requireSpecialCharacters: true,
      },
    },
  },
});
