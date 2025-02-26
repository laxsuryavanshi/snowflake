# BitVolt

BitVolt is a Dropbox-like file storage application built using React for the frontend and AWS services for the backend. It leverages AWS Cognito for secure user authentication and authorization, AWS S3 for scalable file storage, and AWS IAM roles and policies for fine-grained access management.

## Features

- **User Authentication:** Secure user sign-in, and password management powered by AWS Cognito.
- **File Storage:** Scalable and reliable file storage using AWS S3.
- **Access Control:** Fine-grained access management through AWS IAM roles and policies.
- **Intuitive UI:** A user-friendly React-based interface for easy file management.
- **File Upload and Download:** Simple and efficient file upload and download functionality.

## Technologies Used

- **Frontend:** React
- **Authentication & Authorization:** AWS Cognito
- **Storage:** AWS S3
- **Access Management:** AWS IAM
- **Build Tool:** Vite

## Getting Started

To run BitVolt locally, follow these steps:

1.  **Clone the repository:**

    ```bash
    git clone [https://github.com/laxsuryavanshi/snowflake.git](https://github.com/laxsuryavanshi/snowflake.git)
    cd snowflake/bitvolt
    ```

2.  **Configure environment variables:**

    Create a `.env.local` file in the project directory and add the following environment variables with your AWS Cognito and S3 configurations:

    ```
    VITE_USER_POOL_ID=your_user_pool_id
    VITE_USER_POOL_CLIENT_ID=your_user_pool_client_id
    VITE_IDENTITY_POOL_ID=your_identity_pool_id
    VITE_S3_BUCKET_NAME=your_s3_bucket_name
    VITE_S3_BUCKET_REGION=your_s3_bucket_region
    ```

    **Note:** Ensure you have the necessary AWS resources (Cognito user pool, identity pool, S3 bucket, and IAM roles) set up in your AWS account.

3.  **Start the development server:**

    ```bash
    yarn dev
    ```

    This will start the React development server. Open your browser and navigate to `http://localhost:5173` (or the port Vite indicates) to access the application.

## AWS Configuration

To use BitVolt, you need to configure the following AWS resources:

- **AWS Cognito User Pool:** Create a user pool to manage user authentication.
- **AWS Cognito Identity Pool:** Create an identity pool to provide temporary AWS credentials to authenticated users.
- **AWS S3 Bucket:** Create an S3 bucket to store files.
- **AWS IAM Roles and Policies:** Create IAM roles and policies to grant the necessary permissions to Cognito identity pool users for accessing S3. The IAM roles should have permissions to read and write to the specified S3 bucket.

## Important Notes

- Ensure that your AWS credentials and configurations are correctly set up.
- For production deployments, consider using a more robust deployment strategy and secure storage of environment variables.
- For the best security practices, always follow the principle of least privilege when configuring IAM roles and policies.
