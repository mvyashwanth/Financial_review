pipeline {
    agent any

    environment {
        PYTHON = "C:\\Users\\yashwanth\\AppData\\Local\\Programs\\Python\\Python313\\python.exe"
    }

    stages {

        stage('Check Files') {
            steps {
                echo 'Checking project files...'
                bat 'dir'
            }
        }

        stage('Setup Python') {
            steps {
                bat "\"%PYTHON%\" --version"
                bat "\"%PYTHON%\" -m pip --version"
            }
        }

        stage('Install Python Dependencies') {
            steps {
                echo 'Installing Python dependencies...'
                bat "\"%PYTHON%\" -m pip install -r requirements.txt"
            }
        }

        stage('Setup Node') {
            steps {
                echo 'Checking Node.js...'
                bat 'node --version'
                bat 'npm --version'
            }
        }

        stage('Install Frontend Dependencies') {
            steps {
                echo 'Installing frontend dependencies...'
                bat 'cd frontend && npm ci'
            }
        }

        stage('Build Frontend') {
            steps {
                echo 'Building React frontend...'
                bat 'cd frontend && npm run build'
            }
        }

        stage('Deploy') {
            steps {
                echo 'Deploying Financial Review...'

                // Put your actual deployment command here
            }
        }
    }

    post {
        success {
            echo 'Financial Review deployment pipeline completed successfully!'
        }

        failure {
            echo 'Financial Review pipeline failed!'
        }
    }
}
