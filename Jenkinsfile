```groovy
pipeline {
    agent any

    environment {
        PYTHON = "C:\\Users\\yashwanth\\AppData\\Local\\Programs\\Python\\Python313\\python.exe"
    }

    stages {

        stage('Checkout') {
            steps {
                echo 'Checking out Financial Review...'
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
                bat "\"%PYTHON%\" -m pip install -r backend\\requirements.txt"
            }
        }

        stage('Test') {
            steps {
                echo 'Running tests...'

                // If you have pytest:
                // bat "\"%PYTHON%\" -m pytest"

                echo 'Tests completed.'
            }
        }

        stage('Build') {
            steps {
                echo 'Building Financial Review...'

                // Add your actual build command here
            }
        }

        stage('Deploy') {
            steps {
                echo 'Deploying Financial Review...'

                // Add deployment commands here
            }
        }
    }

    post {
        success {
            echo 'Financial Review pipeline completed successfully!'
        }

        failure {
            echo 'Financial Review pipeline failed.'
        }
    }
}
```
