Installation & Setup
1. Clone the repository
git clone https://github.com/your-username/your-repo.git
cd your-repo
2. Install backend dependencies
composer install
3. Environment setup
cp .env.example .env
php artisan key:generate

Configure your database in the .env file.

4. Run migrations
php artisan migrate
5. Serve the application
php artisan serve

App will be available at: