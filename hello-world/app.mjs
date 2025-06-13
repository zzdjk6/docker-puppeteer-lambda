import puppeteer from "puppeteer";
import {nanoid} from "nanoid";
import fs from "node:fs";
import fse from 'fs-extra/esm';
import path from "node:path";
import {PutObjectCommand, S3Client} from "@aws-sdk/client-s3";

/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 *
 * Context doc: https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-context.html
 * @param {Object} context
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 *
 */
export const lambdaHandler = async (event, context) => {
  // Ensure temp folders exists
  ensureFolderExists("/tmp/.cache/puppeteer");
  ensureFolderExists("/tmp/pdf");

  // Launch the browser
  console.log("Launch browser");
  const browser = await puppeteer.launch({
    headless: true,
    dumpio: false,
    timeout: 0,
    executablePath: "/opt/chrome/linux-137.0.7151.70/chrome-linux64/chrome",
    // Refer: https://github.com/umihico/docker-selenium-lambda/blob/main/main.py
    args: [
      "--headless=new",
      "--no-sandbox",
      "--disable-gpu",
      "--window-size=1280x800",
      "--single-process",
      "--disable-dev-shm-usage",
      "--disable-dev-tools",
      "--no-zygote",
      `--user-data-dir=${ensureFolderExists(`/tmp/.puppeteer/user-data-dir/${nanoid()}`)}`,
      `--data-path=${ensureFolderExists(`/tmp/.puppeteer/data-path/${nanoid()}`)}`,
      `--disk-cache-dir=${ensureFolderExists(`/tmp/.puppeteer/disk-cache-dir/${nanoid()}`)}`,
      "--remote-debugging-port=9222",
    ],
  });

  console.log("Load content");
  const page = await browser.newPage();
  const url = "https://pptr.dev/guides/what-is-puppeteer";
  await page.goto(url, { waitUntil: "networkidle2" });

  console.log("Generate PDF");
  const timestamp = new Date().getTime();
  const fileName = `${timestamp}.pdf`;
  const filePath = path.join("/tmp/pdf", fileName);
  await page.pdf({
    path: filePath,
  });

  console.log("Close browser");
  await browser.close();

  const fileSize = fs.statSync(filePath).size;
  const payload = {
    filePath,
    fileName,
    fileSize
  };
  console.log(`Saved file: ${JSON.stringify(payload)}`);

  console.log("Save to S3");
  const fileContent = await fs.promises.readFile(filePath);
  const s3Client = new S3Client();
  const s3Command = new PutObjectCommand({
    Bucket: "docker-puppeteer-lambda-pdf",
    Key: fileName,
    Body: fileContent,
  });
  await s3Client.send(s3Command);

  const response = {
    statusCode: 200,
    body: JSON.stringify(payload),
  };
  return response;
};

const ensureFolderExists = (folderPath) => {
  fse.ensureDirSync(folderPath);
  return folderPath;
};