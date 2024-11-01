// Import required modules
const express = require('express');
const path = require('path');
const fs = require('fs');
const { engine } = require('express-handlebars');
const Handlebars = require('handlebars'); // Import Handlebars to register helpers
const exphbs = require('express-handlebars');
const hbs = require('hbs');

// Initialize the Express application
const app = express();
const PORT = process.env.port || 3000;

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Configure Handlebars as the view engine with '.hbs' file extension
app.engine('.hbs', engine({ extname: '.hbs' }));
app.set('view engine', 'hbs');

// Register the custom "backButton" helper
Handlebars.registerHelper('backButton', (route) => {
    return new Handlebars.SafeString(`<button onclick="window.location.href='${route}'">Back</button>`);
});


// Set up Handlebars
app.engine('hbs', exphbs.engine({ 
    extname: '.hbs',
    helpers: {
        // Add any custom helpers if needed
    }
}));
app.set('view engine', 'hbs');

// Register partials
app.set('views', path.join(__dirname, 'views'));
hbs.registerPartials(path.join(__dirname, 'views/partials'));

// Register the helper to filter out movies with blank metascores (Step 8)
Handlebars.registerHelper('hasMetascore', function (metascore, options) {
    if (metascore && metascore.trim() !== '') {
        return options.fn(this); // Render block if metascore is not blank
    } else {
        return options.inverse(this); // Skip block if metascore is blank
    }
});

//Step 9 Highlight all rows with blank or N/A Metascore
Handlebars.registerHelper('highlightMissingMetascore', (metascore) => {
    // Return a CSS class if Metascore is blank or "N/A"
    return (!metascore || metascore === "N/A") ? 'highlight' : '';
});

// Middleware to parse URL-encoded form data (for POST requests)
app.use(express.urlencoded({ extended: true }));

// Load the JSON data
let movieData = [];
const movieDataPath = path.join(__dirname, 'movie-dataset-a2.json');
fs.readFile(movieDataPath, 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading movie-dataset-a2.json:', err);
        return;
    }
    movieData = JSON.parse(data);
    console.log('Movie data loaded successfully');
});

//Assigment 2 routes
app.get('/users', function(req, res) {
    res.send('respond with a resource');
  });

 



// Define routes for each endpoint in Assignment 1, using `res.render` to render views
app.get('/', (req, res) => {
    res.render('index', { title: 'Alex Batac - N01579147' });
});

app.get('/data', (req, res) => {
    res.render('data', { title: 'View Movie Data', movieData });
});



// Route to render the search form for Movie ID
app.get('/search-id', (req, res) => {
    res.render('search-id', { title: 'Search Movie by ID' });
});

// Route to handle the search by ID
app.post('/search-id', (req, res) => {
    const movieId = parseInt(req.body.movie_id, 10);
    const movie = movieData.find(m => m.Movie_ID === movieId);

    if (movie) {
        // Render movie details
        res.render('movies/movie', { title: 'Movie Found', movie });
    } else {
        // Render error message if movie not found
        res.render('error', { title: 'Movie Not Found', message: 'No movie found with this ID.', backButton: '/search-id' });
    }
});



// Handle search by movie title (using String.includes for partial search)
app.get('/search-title', (req, res) => {
    res.render('search-title', { title: 'Search by Movie Title' });
});

// Handle search by movie title (POST request)
app.post('/search-title', (req, res) => {
    const searchTitle = req.body.movie_title.toLowerCase();
    const matchingMovies = movieData.filter(m => m.Title.toLowerCase().includes(searchTitle));

    if (matchingMovies.length > 0) {
        // Pass all matching movies to the template
        res.render('movies/movies-title', { title: 'Movies Found', movie: matchingMovies });
    } else {
        res.status(404).render('error', {
            title: 'Movie Not Found',
            message: `No movies found with the title "${req.body.movie_title}".`
        });
    }
});

// Route to display all movie data in a table
app.get('/allData', (req, res) => {
    res.render('allData', { title: 'All Movies', movies: movieData });
});


app.get('/movies/pg13', (req, res) => {
    const pg13Movies = movieData.filter(movie => movie.Rated === 'PG-13');
    res.render('movies/pg13', { title: 'PG-13 Movies', movie: pg13Movies });
    });
    


// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
