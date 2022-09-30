// // @ts-check
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const NaverStrategy = require('passport-naver').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const KakaoStrategy = require('passport-kakao').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const verifyModule = require('./register').verifyPassword;

const mongoClient = require('./mongo');

module.exports = () => {
  passport.use(
    new LocalStrategy(
      {
        usernameField: 'id',
        passwordField: 'password',
      },
      async (id, password, cb) => {
        const client = await mongoClient.connect();
        const userCursor = client.db('KDT-1').collection('users');

        const result = await userCursor.findOne({ id });

        if (result !== null) {
          const pwResult = verifyModule(password, result.salt, result.password);

          if (pwResult) cb(null, result);
          else cb(null, false, { message: '비밀번호가 일치하지 않습니다.' });
        } else cb(null, false, { message: '해당 id가 존재하지 않습니다.' });
      }
    )
  );

  passport.use(
    new NaverStrategy(
      {
        clientID: process.env.NV_CLIENT,
        clientSecret: process.env.NV_CLIENT_SECRET,
        callbackURL: process.env.NV_CB_URL,
      },
      async (accessToken, refreshToken, profile, cb) => {
        // console.log(profile);
        const client = await mongoClient.connect();
        const userCursor = client.db('KDT-1').collection('users');

        const result = await userCursor.findOne({ id: profile.id });
        if (result !== null) cb(null, result); // 회원가입 처리된 경우
        else {
          const newUser = {
            id: profile.id,
            name: profile.displayName
              ? profile.displayName
              : profile.emails[0].value,
            provider: profile.provider,
          };

          const dbResult = await userCursor.insertOne(newUser);
          if (dbResult.acknowledged) cb(null, newUser);
          else cb(null, false, { message: '회원 생성을 실패하였습니다.' });
        }
      }
    )
  );

  passport.use(
    new FacebookStrategy(
      {
        clientID: process.env.FB_CLIENT,
        clientSecret: process.env.FB_CLIENT_SECRET,
        callbackURL: process.env.FB_CB_URL,
      },
      async (accessToken, refreshToken, profile, cb) => {
        // console.log(profile);
        const client = await mongoClient.connect();
        const userCursor = client.db('KDT-1').collection('users');

        const result = await userCursor.findOne({ id: profile.id });
        if (result !== null) cb(null, result); // 회원가입 처리된 경우
        else {
          const newUser = {
            id: profile.id,
            name: profile.displayName
              ? profile.displayName
              : profile.emails[0].value,
            provider: profile.provider,
          };

          const dbResult = await userCursor.insertOne(newUser);
          if (dbResult.acknowledged) cb(null, newUser);
          else cb(null, false, { message: '회원 생성을 실패하였습니다.' });
        }
      }
    )
  );

  passport.use(
    new KakaoStrategy(
      {
        clientID: process.env.KA_CLIENT,
        callbackURL: process.env.KA_CB_URL,
      },
      async (accessToken, refreshToken, profile, cb) => {
        // console.log(profile);
        const client = await mongoClient.connect();
        const userCursor = client.db('KDT-1').collection('users');

        const result = await userCursor.findOne({
          id: profile.id,
        });
        if (result !== null) cb(null, result); // 회원가입 처리된 경우
        else {
          const newUser = {
            id: profile.id,
            name: profile.displayName
              ? profile.displayName
              : profile.emails[0].value,
            provider: profile.provider,
          };

          const dbResult = await userCursor.insertOne(newUser);
          if (dbResult.acknowledged) cb(null, newUser);
          else cb(null, false, { message: '회원 생성을 실패하였습니다.' });
        }
      }
    )
  );

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GG_CLIENT,
        clientSecret: process.env.GG_CLIENT_SECRET,
        callbackURL: process.env.GG_CB_URL,
      },
      async (accessToken, refreshToken, profile, cb) => {
        // console.log(profile);
        const client = await mongoClient.connect();
        const userCursor = client.db('KDT-1').collection('users');

        const result = await userCursor.findOne({ id: profile.id });
        if (result !== null) cb(null, result); // 회원가입 처리된 경우
        else {
          const newUser = {
            id: profile.id,
            name: profile.displayName
              ? profile.displayName
              : profile.emails[0].value,
            provider: profile.provider,
          };

          const dbResult = await userCursor.insertOne(newUser);
          if (dbResult.acknowledged) cb(null, newUser);
          else cb(null, false, { message: '회원 생성을 실패하였습니다.' });
        }
      }
    )
  );

  passport.serializeUser((user, cb) => {
    cb(null, user.id);
  });

  passport.deserializeUser(async (id, cb) => {
    const client = await mongoClient.connect();
    const userCursor = client.db('KDT-1').collection('users');
    const result = await userCursor.findOne({ id });
    if (result) cb(null, result);
  });
};
