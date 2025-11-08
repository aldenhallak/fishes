@echo off
REM ========================================
REM 战斗系统自动测试脚本
REM 自动启动服务器、登录并打开战斗测试页面
REM ========================================

cd /d %~dp0

echo ========================================
echo 🎮 Fish Art 战斗系统自动测试
echo ========================================
echo.

REM 设置测试环境变量
echo [1/4] 设置测试账号...
set DEF_USE=test@example.com
set DEF_PASS=test123456
echo ✓ 测试账号: %DEF_USE%
echo.

REM 检查并停止现有服务器
echo [2/4] 检查服务器状态...
tasklist /FI "IMAGENAME eq node.exe" 2>NUL | find /I /N "node.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo ⚠ 检测到运行中的Node进程，正在停止...
    taskkill /F /IM node.exe >NUL 2>&1
    timeout /t 2 /nobreak > nul
)
echo.

REM 启动开发服务器
echo [3/4] 启动开发服务器...
start /b cmd /c "node dev-server.js > server.log 2>&1"
echo ⏳ 等待服务器启动 (5秒)...
timeout /t 5 /nobreak > nul
echo ✓ 服务器已启动
echo.

REM 打开浏览器并导航到登录页面
echo [4/4] 打开浏览器进行测试...
echo.
echo 📋 测试流程:
echo   1. 浏览器将自动打开战斗演示页面
echo   2. 请手动登录测试账号
echo   3. 测试战斗系统的碰撞检测和动画
echo.
echo 🔑 测试账号信息:
echo   Email: %DEF_USE%
echo   Password: %DEF_PASS%
echo.
echo ========================================

REM 打开战斗演示页面
start http://localhost:3000/battle-demo.html

echo.
echo ✅ 浏览器已打开！
echo.
echo 💡 提示:
echo   - 服务器日志: server.log
echo   - 停止服务器: Ctrl+C 或关闭此窗口
echo   - 重新测试: 再次运行此脚本
echo.
echo ========================================
echo 🎯 开始测试战斗系统
echo ========================================
echo.
echo 测试要点:
echo   ✓ 同一行的鱼是否能正常碰撞
echo   ✓ 不同行的鱼是否不会碰撞
echo   ✓ 碰撞效果是否立即显示在两鱼中间
echo   ✓ 所有鱼是否都显示状态UI (Lv, 血条)
echo.
echo 按任意键查看服务器日志...
pause > nul

echo.
echo ========================================
echo 📋 服务器日志
echo ========================================
type server.log
echo.
echo ========================================

echo.
echo 按任意键停止服务器并退出...
pause > nul

REM 停止服务器
echo.
echo 正在停止服务器...
taskkill /F /IM node.exe >NUL 2>&1
echo ✓ 服务器已停止
echo.
echo 测试完成！












