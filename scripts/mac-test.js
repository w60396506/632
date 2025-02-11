﻿const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

// 测试文件系统权限
async function testFilePermissions() {
    const userDataPath = app.getPath('userData');
    const paths = [
        path.join(userDataPath, 'soundbuttons.db'),
        path.join(userDataPath, 'sounds'),
        path.join(userDataPath, 'config')
    ];
    
    for (const p of paths) {
        try {
            if (!fs.existsSync(p)) {
                if (path.extname(p) === '') {
                    await fs.promises.mkdir(p, { recursive: true });
                }
            }
            await fs.promises.access(p, fs.constants.R_OK | fs.constants.W_OK);
            console.log(`${p} 权限正常`);
        } catch (err) {
            throw new Error(`${p} 权限测试失败: ${err.message}`);
        }
    }
}

// 测试数据库
async function testDatabase() {
    const sqlite3 = require('sqlite3').verbose();
    const dbPath = path.join(app.getPath('userData'), 'soundbuttons.db');
    
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(dbPath, (err) => {
            if (err) {
                reject(new Error('数据库连接失败: ' + err.message));
                return;
            }
            console.log('数据库连接成功');
            resolve();
        });
    });
}

// 测试应用功能
async function testAppFeatures() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        show: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });
    
    return new Promise((resolve, reject) => {
        win.loadFile('index.html')
            .then(() => {
                console.log('窗口加载成功');
                win.close();
                resolve();
            })
            .catch((err) => {
                reject(new Error('窗口加载失败: ' + err.message));
            });
    });
}

async function runTests() {
    console.log('开始 macOS 测试...');
    try {
        await testFilePermissions();
        await testDatabase();
        await testAppFeatures();
        console.log('所有测试通过！');
        app.exit(0);
    } catch (error) {
        console.error('测试失败:', error);
        app.exit(1);
    }
}

app.whenReady().then(runTests);
