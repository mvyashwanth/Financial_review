pipeline {
    agent any

    stages {

        stage('Checkout') {
            steps {
                echo 'Checking out Financial Review...'
            }
        }

        stage('Setup Python') {
            steps {
                bat 'python --version'
                bat 'pip --version'
            }
        }

        stage('Install Dependencies') {
            steps {
                bat 'pip install -r requirements.txt'
            }
        }

        stage('Test') {
            steps {
                echo 'Running Flask tests...'
                bat 'python -m pytest'
            }
        }

        stage('Build') {
            steps {
                echo 'Flask application build completed.'
            }
        }

        stage('Deploy') {
            steps {
                echo 'Deploying Financial Review...'
            }
        }
    }
}
