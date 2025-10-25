@echo off
echo ================================
echo Building Magazzino Application
echo ================================

echo.
echo Step 1: Clean and package JAR...
call mvn clean package -DskipTests

if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Maven build failed!
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo Step 2: Creating installer with jpackage...
call mvn jpackage:jpackage

if %ERRORLEVEL% NEQ 0 (
    echo ERROR: jpackage failed!
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo ================================
echo Build completed successfully!
echo ================================
echo.
echo Installer location: target\dist\
echo.
pause