// 해당 코드는 테이블명 : test, 컬럼 : id(auto increment), name(varchar)를 대상으로 테스트한 코드
// api 코드 (src/app/api/user/route.js)
// GET => SELECT
// POST => INSERT
// PUT => UPDATE
// DELETE => DELETE 

import { NextResponse } from 'next/server'
import db from '../../db';
import { promises as fs } from 'fs'; // 프로미스
import path from 'path';
import { v4 as uuidv4 } from 'uuid'; // 파일명 바꿔가면서 생성

export async function GET(req) {  // SELECT

  // console.log("req.query ==> ", req.query);
  const { searchParams } = new URL(req.url)
  const param1 = searchParams.get('param1')
  console.log("req.query ==> ", param1);

  try {
    const uId = searchParams.get('uId');
    console.log("rrrUID==> ", uId);
    const results = await new Promise((resolve, reject) => {
      db.query(`SELECT * FROM post p INNER JOIN test t ON p.U_ID = t.email WHERE p.U_ID = '${uId}' ORDER BY P_NO DESC;`, (err, results) => {
        if (err) {
          console.error('데이터를 가져오는 중 오류 발생:', err);
          reject(err);
        } else {
          console.log('data ==> ', results);
          resolve(results);
        }
      });
    });
    return NextResponse.json(results);
  } catch (error) {
    console.error('데이터를 가져오는 중 오류 발생:', error);
    return NextResponse.error('데이터를 가져올 수 없습니다.', 500);
  }
}

export async function POST(req) { // INSERT
  try {
    // 클라이언트로부터 전송된 JSON 데이터를 파싱합니다.
    // const requestData = await req.json();
    var data = await req.formData();
    const userId = data.get('userId');
    const title = data.get('title');
    const content = data.get('content');
    const tag = data.get('tag');
    const file = data.get('file');
    console.log("file.name ==> ", file);
    const filename = uuidv4() + path.extname(file.name); // 고유한 UUID + 확장자 추출
    const filepath = path.join(process.cwd(), '/public/files/posts', filename); // 파일의 저장 경로
    const bytes = await file.arrayBuffer(); // 업로드된 파일을 바이트 배열로 변환하여 변수에 저장
    const buffer = Buffer.from(bytes); // 바이트 배열을 Buffer 객체로 변환하여 파일을 저장할 때 사용

    try {
      // 파일 저장
      await fs.writeFile(filepath, buffer);

      // DB에 파일 경로 저장(insert 쿼리 실행 부분)
      const insertResult = await new Promise((resolve, reject) => {
        db.query(
        'INSERT INTO post (U_ID, TITLE, CONTENT, P_DATE, PF_NO, TAG) VALUES (?, ?, ?, NOW(), ?, ?)',
        [userId, title, content, filename, tag],
        (err, result) => {
          if (err) {
            console.error('데이터 삽입 중 오류 발생:', err);
            reject(err);
          } else {
            console.log('데이터가 성공적으로 삽입되었습니다.');
            resolve(result);
          }
        });
      });

      return NextResponse.json({ message: '데이터가 성공적으로 저장되었습니다.' });
    } catch (error) {
        console.error(error);
        return NextResponse.error('데이터를 처리할 수 없습니다.', 500);
    }
  } catch (error) {
    console.error('POST 요청 처리 중 오류 발생:', error);
    return NextResponse.error('데이터를 처리할 수 없습니다.', 500);
  }
}


export async function PUT(req) { // UPDATE
  try {
    // 클라이언트로부터 UPDATE 요청을 받으면 데이터를 업데이트합니다.
    // 예시: 데이터베이스에서 특정 ID에 해당하는 데이터를 업데이트

    const updatedData = await req.json(); // 클라이언트가 전달한 업데이트할 데이터

    // 데이터 업데이트 작업
    const updateResult = await new Promise((resolve, reject) => {
      db.query('UPDATE post SET `LIKE` = `LIKE` + 1 WHERE P_NO = ?', [updatedData.pNo], (err, result) => {


        if (err) {
          console.error('데이터 업데이트 중 오류 발생:', err);
          reject(err);
        } else {
          console.log('데이터가 성공적으로 업데이트되었습니다.');
          resolve(result);
        }
      });
    });

    return NextResponse.json({ message: '데이터가 성공적으로 업데이트되었습니다.' });
  } catch (error) {
    console.error('PUT 요청 처리 중 오류 발생:', error);
    return NextResponse.error('데이터를 업데이트할 수 없습니다.', 500);
  }
}
export async function DELETE(req) { // DELETE
  try {
    // 클라이언트로부터 DELETE 요청을 받으면 데이터를 삭제합니다.
    // 예시: 데이터베이스에서 특정 ID에 해당하는 데이터를 삭제
    const deleteData = await req.json(); 
    // 데이터 삭제 작업
    const deleteResult = await new Promise((resolve, reject) => {
      db.query('DELETE FROM test WHERE id = ?', [deleteData.value1], (err, result) => {
        if (err) {
          console.error('데이터 삭제 중 오류 발생:', err);
          reject(err);
        } else {
          console.log('데이터가 성공적으로 삭제되었습니다.');
          resolve(result);
        }
      });
    });

    return NextResponse.json({ message: '데이터가 성공적으로 삭제되었습니다.' });
  } catch (error) {
    console.error('DELETE 요청 처리 중 오류 발생:', error);
    return NextResponse.error('데이터를 삭제할 수 없습니다.', 500);
  }
}