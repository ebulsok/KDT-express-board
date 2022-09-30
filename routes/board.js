// @ts-check
const express = require('express');

const router = express.Router();
const multer = require('multer');
const fs = require('fs');

const mongoClient = require('./mongo');
const login = require('./login');

const dir = './uploads';
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '_' + Date.now());
  },
});
const limits = {
  fileSize: 1024 * 1028 * 2,
};
const upload = multer({ storage, limits });

// 글 목록
router.get('/', login.isLogin, async (req, res) => {
  // console.log(req.user);
  const client = await mongoClient.connect();
  const cursor = client.db('KDT-1').collection('board');
  const ARTICLE = await cursor.find({}).toArray();

  const articleLen = ARTICLE.length;
  res.render('board', {
    ARTICLE,
    articleCounts: articleLen,
    userID: req.session.userID
      ? req.session.userID
      : req.user?.id
      ? req.user?.id
      : req.signedCookies.user,
  });
});

// 글 등록
router.get('/write', login.isLogin, (req, res) => {
  res.render('board_write');
});

router.post('/write', login.isLogin, upload.single('img'), async (req, res) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir);
  console.log(req.file);

  if (req.body.title && req.body.content) {
    const client = await mongoClient.connect();
    const cursor = client.db('KDT-1').collection('board');

    let postID = 1;
    const articleCount = await cursor.count();
    if (articleCount > 0) {
      const lastArticle = await cursor.findOne({}, { sort: { $natural: -1 } });
      postID = lastArticle.postID + 1;
    }

    const newArticle = {
      title: req.body.title,
      content: req.body.content,
      userID: req.session.userID
        ? req.session.userID
        : req.user.id
        ? req.user.id
        : req.signedCookies.user,
      postID: postID,
      userName: req.user?.name ? req.user.name : req.user?.id,
      img: req.file ? req.file.filename : null,
    };

    await cursor.insertOne(newArticle);
    res.redirect('/board');
  } else {
    const err = new Error('Unexpected form data');
    err.statusCode = 404;
    throw err;
  }
});

// 글 수정
router.get('/edit/postID/:postID', login.isLogin, async (req, res) => {
  const client = await mongoClient.connect();
  const cursor = client.db('KDT-1').collection('board');

  const editArticle = await cursor.findOne({
    postID: Number(req.params.postID),
  });
  res.render('board_edit', { editArticle });
});

router.post('/edit/postID/:postID', login.isLogin, async (req, res) => {
  if (req.body.title && req.body.content) {
    const client = await mongoClient.connect();
    const cursor = client.db('KDT-1').collection('board');

    await cursor.updateOne(
      { postID: Number(req.params.postID) },
      { $set: { title: req.body.title, content: req.body.content } }
    );
    res.redirect('/board');
  } else {
    const err = new Error('Unexpected form data');
    err.statusCode = 404;
    throw err;
  }
});

// 글 삭제
router.delete('/delete/postID/:postID', login.isLogin, async (req, res) => {
  const client = await mongoClient.connect();
  const cursor = client.db('KDT-1').collection('board');

  const result = await cursor.deleteOne({ postID: Number(req.params.postID) });
  if (result.acknowledged) res.send('글이 삭제되었습니다.');
  else {
    const err = new Error('Unexpected form data');
    err.statusCode = 404;
    throw err;
  }
});

module.exports = router;
