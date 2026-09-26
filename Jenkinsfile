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
                bat 'dir /s /b'
            }
        }

        stage('Setup Python') {
            steps {
                bat "\"%PYTHON%\" --version"
                bat "\"%PYTHON%\" -m pip --version"
            }
        }

        stage('Install Dependencies') {
            steps {
                bat "\"%PYTHON%\" -m pip install -r requirements.txt"
            }
        }

        stage('Test') {
            steps {
                echo 'Running tests...'
            }
        }

        stage('Build') {
            steps {
                echo 'Building Financial Review...'
            }
        }

        stage('Deploy') {
            steps {
                echo 'Deploying Financial Review...'
            }
        }
    }

    post {
        success {
            echo 'Financial Review pipeline completed successfully!'
        }

        failure {
            echo 'Financial Review pipeline failed!'
        }
    }
}
