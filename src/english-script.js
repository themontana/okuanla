// Form validation and error handling
function validateForm() {
    console.log('Validating form...');
    
    const grade = document.getElementById("grade").value.trim();
    const unit = document.getElementById("unit").value.trim();
    const difficulty = document.getElementById("difficulty").value.trim();
    const structure = document.getElementById("structure").value.trim();

    console.log('Form values:', { grade, unit, difficulty, structure });

    if (!grade || !unit || !difficulty) {
        console.log('Validation failed: Missing required fields');
        showError("Lütfen gerekli alanları doldurun.");
        return false;
    }

    console.log('Form validation passed');
    return true;
}

// Error display function
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'alert alert-danger alert-dismissible fade show';
    errorDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    document.getElementById("textForm").insertBefore(errorDiv, document.getElementById("textForm").firstChild);
    
    // Auto dismiss after 5 seconds
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

// Loading indicator functions
function showLoading() {
    document.querySelector('.loading-spinner').style.display = 'block';
    document.getElementById('output').style.display = 'none';
    document.querySelector('.loading-spinner p').textContent = 'Generating text, please wait...';
    document.querySelector('.loading-spinner').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function hideLoading() {
    document.querySelector('.loading-spinner').style.display = 'none';
}

// Cache management
const cache = new Map();
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

function getCachedResponse(key) {
    const cached = cache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.data;
    }
    return null;
}

function setCachedResponse(key, data) {
    cache.set(key, {
        data,
        timestamp: Date.now()
    });
}

// Rate limiting
let lastRequestTime = 0;
const RATE_LIMIT_DELAY = 2000; // 2 seconds between requests

function checkRateLimit() {
    const now = Date.now();
    if (now - lastRequestTime < RATE_LIMIT_DELAY) {
        showError(`Please wait ${Math.ceil((RATE_LIMIT_DELAY - (now - lastRequestTime)) / 1000)} seconds.`);
        return false;
    }
    lastRequestTime = now;
    return true;
}

// Vocabulary lists
        const grade2Vocabulary = {
            '1': ['ambulance', 'balloon', 'cake', 'café', 'camp', 'doctor', 'football', 'gorilla', 'kangaroo', 'laptop', 'lemon', 'microphone', 'note', 'picnic', 'radio', 'restaurant', 'stadium', 'television', 'train', 'university', 'wagon', 'yoghurt', 'zebra'],
            '2': ['afternoon', 'bye', 'fine', 'great', 'hello', 'hi', 'morning', 'night', 'okay', 'thanks'],
            '3': ['close', 'color', 'cut', 'draw', 'excuse', 'left', 'open', 'paint', 'right', 'say', 'sit', 'stand', 'turn'],
            '4': ['board', 'book', 'crayon', 'desk', 'eraser', 'notebook', 'paper', 'pen', 'pencil', 'school bag', 'scissors', 'table'],
            '5': ['black', 'blue', 'brown', 'color', 'green', 'like', 'orange', 'pink', 'purple', 'red', 'white', 'yellow'],
            '6': ['basketball', 'chess', 'dance', 'football', 'hide and seek', 'jump', 'play', 'run', 'rope', 'sing', 'skip', 'slide', 'walk'],
            '7': ['arm', 'close', 'ear', 'eye', 'finger', 'foot', 'hand', 'head', 'knee', 'mouth', 'nose', 'open', 'point', 'raise', 'show', 'touch'],
            '8': ['bin', 'bird', 'box', 'car', 'cat', 'dog', 'fish', 'rabbit', 'sea', 'stone', 'tree', 'turtle'],
            '9': ['apple', 'banana', 'color', 'cut', 'eat', 'fruit', 'give', 'grapefruit', 'grape', 'lemon', 'melon', 'orange', 'peach', 'touch', 'watermelon'],
            '10': ['chicken', 'cow', 'donkey', 'duck', 'elephant', 'fly', 'goat', 'horse', 'jump', 'lion', 'monkey', 'run', 'sheep', 'snake', 'spider', 'swim']
        };

        const grade3Vocabulary = {
            '1': ['bye!', 'day', 'good afternoon!', 'good bye!', 'good evening!', 'good morning!', 'good night!', 'hello!', 'hi', 'nice', 'weekend', 'see you (soon)', 'spell', 'take care'],
            '2': ['aunt', 'brother', 'cousin', 'dad', 'daughter', 'family', 'father', 'grandfather', 'grandma', 'grandmother', 'grandpa', 'kinship', 'mom', 'mother', 'sister', 'son', 'uncle'],
            '3': ['beautiful', 'big', 'fast', 'fat', 'old', 'short', 'slim', 'slow', 'small', 'strong', 'tall', 'ugly', 'weak', 'young'],
            '4': ['angry', 'bad', 'cook', 'dance', 'drink', 'eat', 'energetic', 'good', 'go', 'happy', 'hungry', 'listen', 'okay', 'play', 'read', 'ride', 'run', 'sad', 'sleep', 'surprised', 'study', 'swim', 'thirsty', 'tired', 'unhappy', 'walk', 'write', 'watch'],
            '5': ['ball', 'black', 'block', 'blue', 'brown', 'button', 'chess', 'computer game', 'doll', 'green', 'kite', 'lorry', 'marble', 'orange', 'plane', 'playing card', 'pink', 'purple', 'red', 'robot', 'teddy bear', 'toy box', 'toy car', 'train', 'white', 'yellow'],
            '6': ['armchair', 'bathroom', 'bed', 'bedroom', 'bookcase', 'carpet', 'cattle', 'chair', 'cup', 'fridge', 'garage', 'garden', 'home', 'house', 'kitchen', 'livingroom', 'playroom', 'rectangle', 'round', 'shampoo', 'soap', 'sofa', 'square', 'table', 'toilet', 'triangle', 'wardrobe'],
            '7': ['bank', 'cafe', 'cinema', 'city', 'hospital', 'library', 'market', 'mosque', 'museum', 'park', 'restaurant', 'school', 'shopping centre', 'town', 'village', 'zoo'],
            '8': ['bike', 'boat', 'bus', 'car', 'helicopter', 'motorcycle', 'plane', 'ship'],
            '9': ['cloudy', 'cold', 'desert', 'freezing', 'hot', 'nice', 'pole', 'rainforest', 'rainy', 'snowy', 'sunny', 'today', 'warm', 'weather', 'wet', 'windy'],
            '10': ['bear', 'bee', 'butterfly', 'chicken', 'cow', 'dolphin', 'donkey', 'duck', 'elephant', 'fish', 'forest', 'frog', 'goat', 'horse', 'ladybird', 'like', 'lion', 'monkey', 'mountain', 'parrot', 'pigeon', 'sea', 'shark', 'snake', 'spider', 'whale']
        };

        const grade4Vocabulary = {
            '1': ['activity', 'again', 'board', 'can', 'card', 'classroom', 'clean', 'close', 'color', 'come', 'congratulations', 'desk', 'door', 'eraser', 'give', 'go back', 'great', 'hand', 'Hello!', 'Here you are.', 'Hi!', 'Hurray!', 'join', 'keep', 'leave', 'let\'s', 'lights', 'listen', 'may', 'name', 'numbers (1-50)', 'of course', 'open', 'pencil case', 'pencil sharpener', 'play', 'please', 'quiet', 'raise', 'ruler', 'school bag', 'square', 'stay at', 'sure', 'teacher', 'tidy', 'turn off', 'turn on', 'what', 'window', 'winner', 'You\'re welcome.'],
            '2': ['America', 'American', 'Britain', 'British', 'country', 'east', 'German', 'Germany', 'he', 'I', 'Iran', 'Iranian', 'Iraq', 'Iraqi', 'Japan', 'Japanese', 'nationality', 'north', 'Pakistan', 'Pakistani', 'Russia', 'Russian', 'she', 'south', 'South Africa', 'South African', 'Turkish', 'Türkiye', 'west', 'where', 'you'],
            '3': ['are', 'can', 'cannot', 'carry', 'climb a tree', 'cycling', 'do puzzle', 'Don\'t worry.', 'drive', 'fly', 'helpful', 'her', 'his', 'is', 'jump high', 'music', 'my', 'my mother\'s car', 'Oh, my God!', 'photography', 'play the guitar', 'play the piano', 'ride a bike', 'ride a horse', 'school club', 'speak', 'superhero', 'swim', 'take picture', 'these', 'this', 'whose', 'your'],
            '4': ['again', 'checkmate', 'chess master', 'dislike', 'do', 'don\'t', 'drawing and coloring', 'fly a kite', 'like', 'pardon', 'play chess', 'play table tennis', 'play with dolls', 'play with marbles', 'read comics', 'ride a bike', 'say', 'singing and dancing', 'slowly', 'swim', 'watch cartoon'],
            '5': ['at night', 'at noon', 'come home', 'do homework', 'early', 'Friday', 'get dressed', 'go shopping', 'go to bed', 'go to school', 'go to the cinema', 'go to the playground', 'have a shower', 'have breakfast', 'have dinner', 'have lunch', 'Hurry up!', 'in the afternoon', 'in the evening', 'in the morning', 'karate class', 'meet with friends', 'Monday', 'o\'clock', 'play computer game', 'read a book', 'Saturday', 'school uniform', 'Sunday', 'Thursday', 'time', 'Tuesday', 'wake up', 'wash your face', 'watch TV', 'Wednesday'],
            '6': ['Be careful!', 'Be patient!', 'Be slow!', 'bean maze', 'behind', 'blow', 'bottle', 'box', 'brush', 'button', 'cardboard', 'chair', 'change', 'coloring pen', 'cotton swab', 'cup', 'cut', 'cut the cardboard', 'daily', 'dip', 'disc', 'dish soap', 'do the experiment', 'draw', 'experiment', 'fold', 'fold the paper', 'food coloring', 'freeze', 'get', 'glass', 'glue', 'glue stick', 'go through', 'Have fun!', 'ice cube', 'impossible', 'in', 'in front of', 'interesting', 'jar', 'kite', 'light maze', 'line', 'materials', 'melt', 'mix', 'mix red and yellow', 'near', 'on', 'pin', 'pinwheel', 'place', 'plant', 'plant the seeds', 'plate', 'push', 'ruler', 'salt', 'school glue', 'science', 'science project', 'scientist', 'scissors', 'shake', 'soil', 'step', 'straw', 'string', 'surprised', 'touch', 'toy box', 'under', 'vegetable oil', 'water the plant'],
            '7': ['actor', 'actress', 'ambulance', 'assembly point', 'businessman', 'businesswoman', 'chef', 'community', 'dance school', 'dancer', 'doctor', 'emergency exit sign', 'farm', 'farmer', 'fire alarm', 'fire station', 'fire truck', 'firefighter', 'flying a plane', 'follow', 'growing vegetables', 'help', 'home', 'hospital', 'hotel', 'instruction', 'job', 'music academy', 'nurse', 'office', 'office worker', 'pilot', 'police car', 'police station', 'policeman', 'policewoman', 'post office', 'restaurant', 'school', 'singer', 'teacher', 'teaching children', 'treating animals', 'treating people', 'vet', 'veterinary clinic', 'waiter', 'waitress', 'workplace', 'writer'],
            '8': ['accessories', 'belt', 'boots', 'borrow', 'clothes', 'coat', 'cold', 'cool', 'dress', 'fall', 'gloves', 'has got', 'have got', 'hot', 'jacket', 'jeans', 'need', 'put on', 'rainy', 'scarf', 'season', 'shirt', 'shorts', 'skirt', 'snowman', 'snowy', 'socks', 'sorry', 'spring', 'summer', 'sunglasses', 'sunny', 'T-shirt', 'trousers', 'umbrella', 'wardrobe', 'warm', 'windy', 'winter'],
            '9': ['age', 'bald', 'beard and mustache', 'beautiful', 'blonde hair', 'blue eyes', 'brown hair', 'curly hair', 'dark hair', 'fat', 'favorite', 'freckles', 'glasses', 'handsome', 'headscarf', 'interesting', 'middle-aged', 'movie', 'old', 'physical characteristic', 'possession', 'short', 'slim', 'straight hair', 'tall', 'thin', 'wavy hair', 'young'],
            '10': ['a', 'an', 'apple', 'bread', 'butter', 'cheese', 'coffee', 'cupcake', 'delicious', 'Do you want...?', 'drinks', 'egg', 'Enjoy your meal!', 'feel', 'fish and chips', 'food', 'full', 'hamburger', 'honey', 'How about...?', 'hungry', 'ice cream', 'lemon', 'lemonade', 'marmalade', 'Maybe later.', 'milk', 'milkshake', 'need', 'olives', 'omelet', 'pasta', 'salad', 'sandwich', 'some', 'soup', 'sugar', 'tea', 'thirty', 'tomato', 'tomato soup', 'try', 'vegetables', 'water', 'What about...?', 'Would you like...?', 'yogurt']
        };

        const grade5Vocabulary = {
            '1': ['American', 'art', 'Britain', 'British', 'camping', 'dislike', 'elementary', 'favourite', 'fishing', 'France', 'French', 'geography', 'German', 'Germany', 'hate', 'history', 'Iran', 'Iranian', 'Iraq', 'Iraqi', 'Italian', 'Italy', 'Japan', 'Japanese', 'language', 'like', 'maths', 'music', 'nationality', 'Pakistan', 'Pakistani', 'physical education', 'primary', 'science', 'secondary', 'social studies', 'Spain', 'Spanish', 'study', 'the USA', 'timetable', 'Türkiye', 'Turkish'],
            '2': ['ahead', 'around', 'bakery', 'bank', 'barber shop', 'bookshop', 'bus stop', 'butcher\'s', 'cinema', 'describe', 'directions', 'environment', 'grocery', 'health', 'hide', 'important', 'in front of', 'instructions', 'left', 'library', 'location', 'map', 'maths', 'mosque', 'museum', 'next to', 'on', 'opposite', 'pharmacy', 'pool', 'post office', 'right', 'shopping mall', 'souvenir shop', 'straight ahead', 'street', 'theatre', 'town', 'toyshop', 'turn'],
            '3': ['basketball', 'blind man\'s buff', 'boxing', 'buy', 'camping', 'checkers', 'chess', 'Chinese Whispers', 'collecting stamps', 'competition', 'computer games', 'cycling', 'dodgeball', 'drop', 'fishing', 'football', 'game', 'ground', 'hangman', 'hiking', 'hobby', 'hop', 'hopscotch', 'horse riding', 'interview', 'join', 'lose', 'love', 'miss', 'origami', 'sculpting', 'skating', 'skiing', 'step', 'stone', 'surfing'],
            '4': ['afternoon', 'arrive', 'breakfast', 'brush', 'call', 'clock', 'comb', 'come', 'daily', 'dinner', 'eat', 'evening', 'foreigner', 'get dressed', 'get on', 'get off', 'get out of bed', 'get up', 'go online', 'go to bed', 'homework', 'leave', 'lunch', 'meet', 'morning', 'neighbour', 'night', 'office', 'play with toys', 'quarter', 'rest', 'routine', 'sleep', 'study', 'surf', 'take a shower', 'talk', 'toothbrush', 'toothpaste', 'watch', 'wash', 'swimming', 'teach', 'tennis', 'throw', 'turn', 'volleyball', 'walking', 'water polo', 'win', 'winner'],
            '5': ['ache', 'awful', 'backache', 'blanket', 'broken leg', 'chips', 'cinnamon', 'cold', 'cough', 'cut', 'dentist', 'earache', 'egg', 'examine', 'faint', 'feel', 'feeling', 'fever', 'fish', 'flu', 'headache', 'healthy', 'heavy', 'herbal tea', 'honey', 'hot', 'hurt', 'ill', 'illness', 'linden', 'margarine', 'matter', 'medicine', 'mint', 'need', 'pain', 'painkiller', 'pills', 'pyjamas', 'remedy', 'rest', 'salami', 'should', 'sick', 'sickness', 'sneeze', 'sore throat', 'stomachache', 'suggest', 'suggestion', 'syrup', 'tired', 'toothache', 'unhealthy', 'vitamin', 'yoghurt'],
            '6': ['action', 'adventure', 'animation', 'bad', 'beautiful', 'boring', 'brave', 'cartoon', 'catch', 'character', 'comedy', 'decide', 'evil', 'exciting', 'fantasy', 'film', 'friendly', 'frightening', 'funny', 'hardworking', 'help', 'helpful', 'honest', 'horror', 'human', 'kind', 'lazy', 'love', 'loving', 'movie', 'musical', 'nonsense', 'opinion', 'powerful', 'protect', 'race', 'return', 'romantic', 'save', 'scene', 'science fiction', 'smart', 'strong', 'successful', 'think', 'ticket', 'travel', 'try', 'ugly', 'western', 'wild'],
            '7': ['April', 'August', 'balloon', 'birthday', 'birthday cake', 'biscuits', 'buy', 'camera', 'candle', 'celebrate', 'clown', 'December', 'decoration', 'delicious', 'drink', 'exciting', 'February', 'Friday', 'fruit', 'gift', 'hat', 'have a party', 'invitation', 'January', 'July', 'June', 'kite', 'March', 'May', 'Monday', 'music', 'must', 'November', 'October', 'old', 'permission', 'preparation', 'prepare', 'present', 'reservation', 'Saturday', 'September', 'Sunday', 'sweet', 'throw a party', 'Thursday', 'Tuesday', 'Wednesday'],
            '8': ['activity', 'athletics', 'baseball', 'basketball', 'boxing', 'camping', 'climbing', 'club (golf)', 'cycling', 'do exercise', 'fishing', 'fitness', 'gloves', 'golf', 'gym', 'gymnastics', 'helmet', 'hiking', 'hockey', 'horse riding', 'ice hockey', 'ice skating', 'jogging', 'judo', 'jump', 'motorcycling', 'net', 'racket', 'register', 'registration', 'roller skating', 'running', 'sit down', 'skates', 'ski', 'skiing', 'stick', 'tennis', 'trekking', 'twice', 'walk', 'warm up', 'waterskiing', 'weight', 'weightlifting', 'work out'],
            '9': ['adopt', 'bark', 'bird', 'calf', 'cat', 'chick', 'chicken', 'claw', 'cool', 'cow', 'dangerous', 'dog', 'duck', 'duckling', 'examine', 'feed', 'fish', 'foal', 'gender', 'get', 'goose', 'gosling', 'hamster', 'help', 'hen', 'horse', 'kitten', 'lamb', 'mouse', 'nationality', 'paint', 'puppy', 'rabbit', 'register', 'registration', 'save', 'scare', 'sheep', 'shelter', 'sleep', 'snake', 'tail', 'turtle', 'vet', 'want'],
            '10': ['bonfire', 'carve', 'celebrate', 'Children\'s Day', 'Christian', 'costume', 'death', 'dessert', 'dragon', 'Easter', 'Eid', 'elder', 'fasting', 'festival', 'govern', 'Halloween', 'hide', 'host', 'independence', 'joke', 'lantern', 'light', 'meat', 'mosque', 'parliament', 'participate', 'pumpkin', 'Ramadan', 'relative', 'stay', 'traditional', 'visitor', 'wear']
        };

        const grade6Vocabulary = {
            '1': ['attend', 'date', 'diary', 'rest', 'run errands', 'step dance', 'take a nap', 'take care of something', 'take courses', 'visit', 'traditional/folk dance'],
            '2': ['bagel', 'bread', 'butter', 'cereal', 'cheese', 'coffee', 'croissant', 'egg', 'fruit juice', 'jam', 'junk food', 'healthy', 'honey', 'milk', 'muffin', 'pancake', 'sausage', 'nutritious', 'tea', 'toast'],
            '3': ['busy', 'crowded', 'downtown', 'feed', 'hometown', 'high', 'kiosk', 'sell', 'skyscraper', 'street', 'town', 'traffic jam'],
            '4': ['anxious', 'cloudy', 'desert', 'energetic', 'fabulous', 'foggy', 'freezing', 'hailing', 'happy', 'lightning', 'moody', 'okay', 'scared', 'sleepy', 'stormy', 'windy'],
            '5': ['amazing', 'boring', 'bumper car', 'carnival', 'carousel', 'crazy', 'dull', 'exciting', 'fair', 'fantastic', 'Ferris wheel', 'ghost train', 'horrible', 'interesting', 'roller coaster', 'train ride'],
            '6': ['architect', 'cook', 'dentist', 'driver', 'engineer', 'farmer', 'hairdresser', 'lawyer', 'manager', 'mechanic', 'salesman/saleswoman', 'teacher', 'waiter/waitress'],
            '7': ['forest', 'flower', 'fruit', 'lake', 'mountain', 'pick', 'river', 'sailing', 'seaside', 'sightseeing', 'skiing', 'snowball', 'snowman', 'tent', 'tree'],
            '8': ['author/writer', 'borrow/lend', 'bookshelf', 'dictionary', 'e-book', 'important', 'information', 'library', 'look at/for/up', 'magazine', 'newspaper', 'novel', 'poetry', 'story'],
            '9': ['air/water/noise pollution', 'cut down', 'damage', 'garbage', 'electrical device', 'harm', 'litter', 'plug (unplug)', 'recycle', 'rubbish', 'reduce', 'save', 'trash', 'waste'],
            '10': ['ballot box', 'campaign', 'candidate', 'child/human right', 'election', 'fair law', 'make/give a speech', 'president', 'poll', 'public', 'respect', 'republic', 'vote']
        };

        const grade7Vocabulary = {
            '1': ['Attractive', 'Bald', 'Beautiful', 'Blonde', 'Clever', 'Clumsy', 'Crazy', 'Curly', 'Cute', 'Easy-going', 'Friendly', 'Generous', 'Gentle', 'Good', 'Handsome', 'Hardworking', 'Hat', 'Headscarf', 'Helpful', 'Honest', 'Kind', 'Lazy', 'Nice', 'Old', 'Outgoing', 'Personality', 'Plump', 'Polite', 'Popular', 'Punctual', 'Selfish', 'Slim', 'Smart', 'Straight', 'Stubborn', 'Successful', 'Twins', 'Wavy', 'Well-built', 'Young'],
            '2': ['Achieve', 'Always', 'Applause', 'Baseball', 'Beat', 'Diet', 'Draw', 'Equipment', 'Exercise', 'Fan', 'Goal', 'Golf', 'Hit', 'Individual', 'Indoor', 'Injury', 'Jogging', 'Late', 'Legend', 'Lose', 'Medal', 'Never', 'Often', 'Once', 'Opponent', 'Opportunity', 'Outdoor', 'Pitch', 'Point', 'Rarely', 'Referee', 'Regularly', 'Score', 'Skating', 'Skiing', 'Snowboarding', 'Sometimes', 'Spectator', 'Sporty', 'Sprinter', 'Success', 'Swimming', 'Team', 'Tennis', 'Train', 'Twice', 'Usually', 'Wake up', 'Weight lifting', 'Whistle', 'Win', 'Winner', 'World record'],
            '3': ['Actor', 'Actress', 'Alone', 'Award', 'Brilliant', 'Children', 'Compose', 'Composer', 'Deaf', 'Die', 'Eager', 'Explorer', 'Film director', 'Get engaged', 'Get married', 'Graduate', 'Grow up', 'Inventor', 'Kid', 'Marriage', 'Move', 'Musician', 'Own', 'Pilot', 'Politician', 'Poverty', 'President', 'Prize', 'Producer', 'Raise', 'Scientist', 'Singer', 'Songwriter', 'Violinist', 'Win', 'Writer'],
            '4': ['Afraid', 'Alligator', 'Ant', 'Attack', 'Bat', 'Beak', 'Bear', 'Bee', 'Bird', 'Butterfly', 'Camel', 'Chameleon', 'Cheetah', 'Cockroach', 'Condor', 'Crocodile', 'Desert', 'Destroy', 'Dolphin', 'Eagle', 'Eel', 'Elephant', 'Endangered', 'Extinct', 'Falcon', 'Feather', 'Fin', 'Fish', 'Fly', 'Fox', 'Frog', 'Fur', 'Gill', 'Giraffe', 'Goldfish', 'Grassland', 'Habitat', 'Harm', 'Hawk', 'Horn', 'Hunt', 'Insect', 'Jungle', 'Koala bear', 'Ladybug', 'Leg', 'Lion', 'Lizard', 'Mammal', 'Monkey', 'Neck', 'Nose', 'Overhunt', 'Owl', 'Parrot', 'Pigeon', 'Plant', 'Poisonous', 'Polar bear', 'Pollute', 'Pollution', 'Population', 'Prey', 'Protect', 'Protection', 'Rabbit', 'Reptile', 'Rhino', 'Roar', 'Salmon', 'Save', 'Scale', 'Sea otter', 'Seal', 'Shark', 'Shelter', 'Skin', 'Snail', 'Snake', 'Species', 'Spider', 'Stripe', 'Survive', 'Swan', 'Tail', 'Tiger', 'Trunk', 'Tuna', 'Turtle', 'Tusk', 'Whale', 'Whisker', 'Wild', 'Wing', 'Woodland', 'Zebra'],
            '5': ['Addict', 'Advantageous', 'Amusing', 'Animation', 'Appear', 'Audience', 'Boring', 'Cartoon', 'Channel', 'Comedy', 'Commercial', 'Director', 'Discussion', 'Documentary', 'Enjoyable', 'Exciting', 'Fantastic', 'Funny', 'Horror', 'Match', 'Movie', 'News', 'Prefer', 'Pretty', 'Quiz show', 'Reality show', 'Recommend', 'Remote control', 'Romantic', 'Science fiction', 'Series', 'Sitcom', 'Soap opera', 'Talk show', 'Violence', 'Weather forecast', 'Western'],
            '6': ['Accept', 'A few', 'A little', 'A lot of', 'Any', 'Arrange', 'Attend', 'Balloon', 'Barbecue party', 'Beverage', 'Birthday party', 'Blow', 'Candle', 'Competition', 'Cookies', 'Costume', 'Decorate', 'Dress up', 'Drinks', 'Education', 'Fancy dress party', 'Farewell party', 'Graduation party', 'Guest', 'Help', 'Host', 'Invitation', 'Invite', 'Join', 'Lemonade', 'Need', 'New year party', 'Organize', 'Prepare', 'Present', 'Refuse', 'Some', 'Theme', 'Wrap'],
            '7': ['Abroad', 'Belief', 'Believe', 'Business', 'Career', 'Champion', 'Definitely', 'Die', 'Dream', 'Earn', 'Education', 'Excellent', 'Famous', 'Fan', 'Future', 'Guess', 'Graduate', 'Hope', 'Hopeful', 'Imagine', 'Lucky', 'Make a guess', 'Own', 'Peaceful', 'Popular', 'Poverty', 'Predict', 'Prediction', 'Probably', 'Receive', 'Rich', 'Skill', 'Survive', 'Tell a lie', 'Travel', 'Upset', 'War', 'Well-paid', 'Win', 'World'],
            '8': ['Accept', 'Amusement', 'Art gallery', 'Ask for help', 'Bakery', 'Bookshop', 'Burglary', 'Bus-stop', 'Butcher', 'Cake', 'Chemist\'s', 'Church', 'City', 'City hall', 'Coffee shop', 'Department store', 'Exhibition', 'Fire station', 'Fruit', 'Game store', 'Governorship', 'Greengrocery', 'Grocery', 'Have fun', 'Headache', 'Magazine', 'Meat', 'Medicine', 'Movie theater', 'Municipal office', 'Municipality', 'Music store', 'Noisy', 'Opportunity', 'Pay taxes', 'Pet shop', 'Police station', 'Post', 'Present', 'Puppy', 'Refuse', 'Rice', 'Rubbish', 'Shopping mall', 'Suggest', 'Toy'],
            '9': ['Add', 'Air pollution', 'Animal extinction', 'Atmosphere', 'Balance', 'Burn', 'Change', 'Climate', 'Climate change', 'Coal', 'Collect', 'Damage', 'Deforestation', 'Device', 'Drought', 'Eco-friendly', 'Efficient', 'Endangered', 'Environment', 'Environmental', 'Extinction', 'Famine', 'Filter', 'Fire', 'Forest', 'Forest fire', 'Fuel', 'Garbage', 'Glass', 'Global warming', 'Greenhouse effect', 'Harm', 'Have a bath', 'Hole', 'Increase', 'Inform', 'Kill', 'Knead', 'Light', 'Melt', 'Metal', 'Mix', 'Nature', 'Noise pollution', 'Ozone layer', 'Paper', 'Perfume', 'Plant', 'Pollute', 'Pollution', 'Produce', 'Product', 'Protect', 'Public transportation', 'Quality', 'Rapidly', 'Recyclable', 'Recycle', 'Recycling bin', 'Renewable', 'Responsible', 'Reuse', 'Save', 'Smooth', 'Solar energy', 'Switch off', 'Take action', 'Temperature', 'Threaten', 'Throw', 'Turn off', 'Vehicle', 'Waste', 'Wind energy', 'Wood'],
            '10': ['Atmosphere', 'Claim', 'Cold', 'Comet', 'Cool', 'Crew', 'Discover', 'Dusty', 'Dwarf planet', 'Earth', 'Evidence', 'Expedition', 'Experiment', 'Explore', 'Flat ring', 'Galaxy', 'Gravity', 'Icy ring', 'Large', 'Lunar eclipse', 'Massive', 'Meteor', 'Meteor shower', 'Moon', 'Observe', 'Orbit', 'Planet', 'Proof', 'Rescue', 'Revolve', 'Ring', 'Satellite', 'Scientist', 'Solar eclipse', 'Solar System', 'Solid', 'Space', 'Spacecraft', 'Space shuttle', 'Space station', 'Spin', 'Star', 'Sun', 'Surface', 'Universe', 'Zip']
        };

        const grade8Vocabulary = {
            '1': ['accept', 'activity', 'adventurous', 'aggressive', 'amusement park', 'amusing', 'apologize', 'arrogant', 'atmosphere', 'attend', 'awesome', 'back up', 'bad-tempered', 'best friend', 'beverage', 'birthday', 'caring', 'celebrate', 'close', 'count on', 'cultural', 'customer', 'decide', 'dessert', 'determined', 'event', 'expect', 'family tie', 'friendship', 'generous', 'get on well with somebody', 'have things in common', 'honest', 'in advance', 'inform', 'interest', 'invitation', 'jealous', 'join', 'lentil soup', 'local', 'main dish', 'mean', 'meatball', 'memory', 'music band', 'opportunity', 'organize', 'primary school', 'refuse', 'relationship', 'reunion', 'salad', 'self-centered', 'share', 'similar', 'slumber party', 'sneaky', 'soup', 'stubborn', 'support', 'supportive', 'tactful', 'take order', 'theater', 'together', 'tonight', 'tram station', 'trust', 'truth', 'unreliable', 'until', 'vacation', 'waiter/waitress'],
            '2': ['after-school activities', 'always', 'application', 'beatbox', 'behave', 'classical', 'contact', 'everybody', 'exciting', 'fairly', 'get dressed', 'go bowling', 'greet', 'heavy metal', 'heritage', 'huge', 'interested in', 'jazz', 'movie theater', 'never', 'often', 'once', 'opera', 'pool', 'pop music', 'prefer', 'rap music', 'rarely', 'realistic', 'relative', 'respectful', 'rhythm', 'ridiculous', 'sometimes', 'surf the Internet', 'take a bath', 'techno music', 'teen life', 'teenager', 'tradition', 'train', 'trendy', 'twice', 'types of music', 'typical', 'unbearable', 'usually', 'wonderful'],
            '3': ['after', 'bake', 'baking powder', 'bitter', 'boil', 'cake pan', 'chop', 'cook', 'cooking', 'cover', 'cucumber', 'cup', 'dice', 'everywhere', 'finally', 'firmly', 'flour', 'food', 'freeze', 'fry', 'greasy', 'heat', 'homemade', 'lengthwise', 'mash', 'meat', 'milky', 'mix', 'mixture', 'oil', 'onion', 'pasta', 'peel', 'pepper', 'piece', 'pizza', 'recipe', 'remove', 'rice', 'salty', 'saucepan', 'sausage', 'seaweed', 'serve', 'slice', 'sour', 'spicy', 'spread', 'sprinkle', 'stir', 'surface', 'sushi', 'sweet', 'tablespoon', 'tasty', 'teaspoon', 'then', 'tongue twister', 'various', 'vegetable', 'wrap'],
            '4': ['amazing', 'comment', 'communication', 'confirm', 'connect', 'countryside', 'customer', 'decision', 'delivery', 'disabled', 'doctor\'s appointment', 'donate', 'each other', 'educative', 'especially', 'foreign country', 'future', 'get driver\'s license', 'get married', 'go camping', 'graduate', 'hang on', 'hear', 'historic place', 'history', 'hold on', 'improve', 'invent', 'invention', 'keep in touch', 'leave a message', 'messenger bird', 'postcard', 'printing machine', 'raise awareness', 'reality', 'receiver', 'refugee', 'repeat', 'safety', 'sender', 'smoke signal', 'social network', 'surgical operation', 'take an exam', 'television transmission', 'through', 'tough', 'touristic destination', 'transatlantic', 'unavailable'],
            '5': ['account', 'advantage', 'application', 'attach', 'attachment', 'browser', 'click', 'comment', 'confirm', 'connection', 'copyright', 'departure date', 'disadvantage', 'do the shopping', 'download/upload', 'educational webpage', 'etiquette rule', 'file', 'gently', 'habit', 'individual', 'influential', 'location', 'log in/out', 'make an excuse', 'make friend', 'mobile device', 'pay the bill', 'privacy', 'properly', 'refundable', 'regulate', 'round trip', 'screen', 'search engine', 'social media', 'social networking site', 'user', 'worldwide'],
            '6': ['adrenalin seeker', 'adventure', 'adventurous', 'attack', 'bridge', 'canoeing', 'challenging', 'cliff', 'cost', 'danger', 'dangerous', 'do bungee jumping', 'drown', 'entertaining', 'exactly', 'experience', 'extreme sports', 'fascinating', 'gift', 'go caving', 'go rafting', 'go scuba-diving', 'hang-gliding', 'heli-skiing', 'kayaking', 'magazine', 'motor racing', 'mountainous road', 'ocean', 'safe', 'safety equipment', 'shark', 'skydiving', 'structure', 'tournament', 'traditional', 'trekking route', 'underwater hockey', 'waterfall'],
            '7': ['abandon', 'accommodation', 'all-inclusive', 'amphitheater', 'ancient', 'architecture', 'beach', 'bed and breakfast', 'brochure', 'bullfighting', 'century', 'citizen', 'city-sightseeing', 'climate', 'conquer', 'construction', 'contain', 'cultural diversity', 'delicious', 'determination', 'emperor', 'equality', 'exotic', 'fascinating', 'folk dance', 'folklore', 'forest', 'guesthouse', 'handcraft', 'historic site', 'incredible', 'invasion', 'justice', 'land', 'magnificent', 'mercifulness', 'palace', 'paragliding', 'population', 'port', 'private', 'responsibility', 'south', 'spectator', 'tourism', 'trade route', 'via', 'vote', 'weigh', 'wonder'],
            '8': ['annoyed', 'bored', 'chore', 'clean the windows', 'cook/prepare the meals', 'decorate', 'depend on', 'do the shopping', 'do the laundry', 'encouraging', 'female', 'get bored', 'immediately', 'iron the clothes', 'load/empty the dishwasher', 'male', 'mess', 'mow the lawn', 'nervous', 'obey', 'obligation', 'questionnaire', 'responsibility', 'ribbon'],
            '9': ['advanced', 'alchemy', 'article', 'astronomy', 'bestselling', 'binoculars', 'chemist', 'common', 'complex', 'contribution', 'cosmology', 'currently', 'debate', 'development', 'diagnose', 'difference', 'discovery', 'durable', 'encourage', 'endeavor', 'equation', 'explore', 'field', 'fix a problem', 'generate', 'government', 'humanity', 'improve', 'individual', 'item', 'layer', 'medicine', 'medieval', 'mold', 'paradox', 'philosophy', 'precaution', 'product', 'protect', 'prototype', 'publish', 'science', 'scientist', 'separate', 'stem cell', 'substance', 'successfully', 'surface', 'theoretical physics', 'transform', 'vaccination', 'various', 'weapon', 'wrap'],
            '10': ['aftershock', 'air conditioning', 'air pollution', 'altitude', 'approach', 'approximately', 'arc', 'avalanche', 'biological pollutant', 'campaign', 'deforestation', 'disaster', 'distance', 'drought', 'dust', 'earthquake', 'ecosystem destruction', 'everlasting', 'flood', 'force', 'fossil fuel depletion', 'glacier', 'global warming', 'horizon', 'hurricane', 'infection', 'landslide', 'lightning', 'magnitude', 'mold', 'natural', 'occur', 'occurrence', 'phenomenon', 'polar', 'pollute', 'preserve', 'pressure', 'recyclable', 'rescue team', 'severity', 'soil contamination', 'sunlight', 'take measure', 'threatening', 'tornado', 'toxic', 'toxic waste', 'transportation', 'tsunami', 'volcanic eruption', 'water shortage', 'wildlife conservation']
        };

// Form submission handler
document.getElementById("textForm").addEventListener("submit", async function (event) {
    console.log('Form submitted');
    event.preventDefault();

    if (!validateForm() || !checkRateLimit()) {
        console.log('Form validation failed or rate limit exceeded');
        return;
    }

    const grade = document.getElementById("grade").value.trim();
    const unit = document.getElementById("unit").value.trim();
    const difficulty = document.getElementById("difficulty").value.trim();
    const structure = document.getElementById("structure").value.trim();

    console.log('Form values:', { grade, unit, difficulty, structure });

    // Get vocabulary for selected grade and unit
    let vocabularyList = [];
    if (grade === "2" && grade2Vocabulary[unit]) {
        vocabularyList = grade2Vocabulary[unit];
    } else if (grade === "3" && grade3Vocabulary[unit]) {
        vocabularyList = grade3Vocabulary[unit];
    } else if (grade === "4" && grade4Vocabulary[unit]) {
        vocabularyList = grade4Vocabulary[unit];
    } else if (grade === "5" && grade5Vocabulary[unit]) {
        vocabularyList = grade5Vocabulary[unit];
    } else if (grade === "6" && grade6Vocabulary[unit]) {
        vocabularyList = grade6Vocabulary[unit];
    } else if (grade === "7" && grade7Vocabulary[unit]) {
        vocabularyList = grade7Vocabulary[unit];
    } else if (grade === "8" && grade8Vocabulary[unit]) {
        vocabularyList = grade8Vocabulary[unit];
    }

    // Create cache key
    const cacheKey = `${grade}-${unit}-${difficulty}-${structure}`;
    
    // Check cache first
    const cachedResponse = getCachedResponse(cacheKey);
    if (cachedResponse) {
        console.log('Using cached response');
        displayContent(cachedResponse);
        return;
    }

    showLoading();

    try {
        let prompt = `Please generate an English reading text.

IMPORTANT FORMAT:
- Create a reading text suitable for grade ${grade} elementary school students
- Difficulty level: ${difficulty === 'easy' ? 'EASY - Use only simple and clear sentences with Simple Present Tense' : difficulty === 'medium' ? 'MEDIUM' : 'HARD'}
- Use the following grammar structure: ${structure}
- The text should be engaging and appropriate for the grade level
- Include a title for the text
- Use these vocabulary words in the text (choose at least 5): ${vocabularyList.join(', ')}
- Include 4 comprehension questions after the text
- Format the questions under "Questions:" heading
- Do not include answers
- Do not include any introductory text or explanations
- Start with the title, then the reading text${difficulty === 'easy' ? '\n- Keep sentences short and simple\n- Use only Simple Present Tense\n- Avoid complex sentence structures' : ''}`;

        console.log('Sending prompt:', prompt);
        
        const response = await fetch('/api/generate-text', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ prompt })
        });

        console.log('Response status:', response.status);

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Response data:', data);
        
        if (data.error) {
            throw new Error(data.error);
        }

        // Cache the response
        setCachedResponse(cacheKey, data.generatedText);
        
        // Display the content
        displayContent(data.generatedText);

    } catch (error) {
        console.error('Error:', error);
        showError(`An error occurred: ${error.message}`);
        hideLoading();
    }
});

// Content display function
function displayContent(generatedText) {
    hideLoading();
    
    const output = document.getElementById("output");
    output.style.display = "block";
    
    // Split title, text and questions
    let [title, ...rest] = generatedText.split('\n\n');
    let text = '', questions = '';
    
    // Find where questions start
    const questionsIndex = rest.findIndex(part => part.toLowerCase().includes('questions:'));
    if (questionsIndex !== -1) {
        text = rest.slice(0, questionsIndex).join('\n\n');
        questions = rest.slice(questionsIndex).join('\n\n');
    } else {
        text = rest.join('\n\n');
    }
    
    // Clean up the text and remove asterisks
    title = title.trim().replace(/\*/g, '');
    text = text.trim().replace(/\*/g, '');
    questions = questions ? questions.replace(/Questions:/i, '').replace(/\*/g, '').trim() : '';
    
    // Format questions into cards
    let questionCards = '';
    if (questions) {
        questionCards = questions.split(/\d+\./)
            .filter(q => q.trim())
            .map((q, i) => `
                <div class="card mb-3">
                    <div class="card-body">
                        <p class="card-text">${i + 1}. ${q.trim().replace(/\*/g, '')}</p>
                    </div>
                </div>
            `).join('');
    }

    // Combine all content
    output.innerHTML = `
        <div class="main-wrapper">
            <div class="main-container">
                <div class="action-buttons text-center mb-4 d-print-none">
                    <button id="printButton" class="btn btn-primary">
                        <i class="fas fa-print me-2"></i>Print
                    </button>
                </div>
                <div class="content-section">
                    <h3 class="text-center mb-4">${title}</h3>
                    <div class="text-content mb-4">
                        ${text.split('\n').map(p => `<p>${p}</p>`).join('')}
                    </div>
                    ${questions ? `
                        <div class="questions-section">
                            <h5 class="mb-3">Questions:</h5>
                            <div class="questions-grid">
                                ${questionCards}
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>
        </div>
    `;

    // Add styles to the head
    const styleElement = document.createElement('style');
    styleElement.textContent = `
        .main-wrapper {
            width: 100%;
            display: flex;
            justify-content: center;
            padding: 10px;
        }
        .main-container {
            width: 100%;
            max-width: 800px;
            margin: 0 auto;
            padding: 15px;
        }
        .content-section {
            width: 100%;
            margin-bottom: 1rem;
        }
        .text-content {
            color: #333;
            line-height: 1.6;
            font-size: 12pt;
            text-align: justify;
        }
        .questions-section {
            margin-top: 2rem;
            padding-top: 1.5rem;
            border-top: 2px solid #eee;
        }
        .questions-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
        }
        .card {
            break-inside: avoid;
            margin-bottom: 1rem;
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 1rem;
        }
        .card-text {
            margin: 0;
            font-size: 12pt;
            color: #444;
            text-align: left;
            align-self: flex-start;
        }
        @media (max-width: 768px) {
            .main-wrapper {
                padding: 5px;
            }
            .main-container {
                padding: 5px;
            }
            .content-section {
                padding: 0 10px;
            }
            .text-content {
                font-size: 14px;
                line-height: 1.5;
            }
            .questions-section {
                padding: 0 10px;
            }
            .questions-grid {
                grid-template-columns: 1fr;
                gap: 0.5rem;
            }
            .card {
                margin-bottom: 10px;
                padding: 0.8rem;
            }
            .card-text {
                font-size: 14px;
            }
            .action-buttons {
                display: flex;
                flex-direction: column;
                gap: 10px;
                align-items: stretch;
            }
            .action-buttons .btn {
                margin: 0 !important;
                width: 100%;
            }
        }
        @media print {
            @page {
                size: A4;
                margin: 2cm;
            }
            body { 
                padding: 0;
                font-size: 11pt;
            }
            .main-container {
                max-width: 100%;
                padding: 0;
            }
            .action-buttons, h4 {
                display: none !important;
            }
            .questions-grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 1rem;
            }
            .card {
                break-inside: avoid;
                border: 1px solid #ddd !important;
                margin-bottom: 0.5rem !important;
            }
            .card-text {
                font-size: 11pt !important;
                line-height: 1.5 !important;
            }
            .watermark {
                position: fixed !important;
                top: 10px !important;
                left: 15px !important;
                font-size: 8pt !important;
                color: #999 !important;
            }
        }
    `;
    document.head.appendChild(styleElement);

    // Add event listeners for buttons
    const printButton = document.getElementById("printButton");

    if (printButton) {
        printButton.addEventListener("click", function() {
            const printContent = document.querySelector('.main-container').cloneNode(true);
            const actionButtons = printContent.querySelector('.action-buttons');
            if (actionButtons) actionButtons.remove();
            
            const printWindow = window.open('', '', 'height=600,width=800');
            
            printWindow.document.write(`
                <html>
                <head>
                    <title>OkuAnla - English Reading</title>
                    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
                    <style>
                        @page {
                            margin: 1cm;
                        }
                        body {
                            padding: 15px;
                            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                            background: white;
                        }
                        .watermark {
                            position: fixed;
                            top: 10px;
                            left: 15px;
                            font-size: 11px;
                            color: #999;
                            font-weight: 500;
                            opacity: 0.7;
                            z-index: 1000;
                        }
                        .header-line {
                            position: relative;
                            border-top: 1px solid #000;
                            margin: 35px 15px 20px;
                        }
                        .main-wrapper {
                            width: 100%;
                            display: flex;
                            justify-content: center;
                        }
                        .main-container {
                            width: 100%;
                            max-width: 800px;
                            margin: 0 auto;
                            padding: 15px;
                        }
                        .text-content {
                            color: #333;
                            line-height: 1.6;
                            font-size: 12pt;
                            text-align: justify;
                        }
                        .questions-section {
                            margin-top: 2rem;
                            padding-top: 1.5rem;
                            border-top: 2px solid #eee;
                        }
                        .questions-grid {
                            display: grid;
                            grid-template-columns: repeat(2, 1fr);
                            gap: 1rem;
                        }
                        .card {
                            break-inside: avoid;
                            margin-bottom: 1rem;
                            border: 1px solid #ddd;
                            border-radius: 8px;
                            padding: 1rem;
                        }
                        .card-text {
                            margin: 0;
                            font-size: 12pt;
                            color: #444;
                            text-align: left;
                            align-self: flex-start;
                        }
                        @media print {
                            body { padding: 0; }
                            .watermark { position: fixed; }
                            .questions-grid {
                                display: grid;
                                grid-template-columns: repeat(2, 1fr);
                                gap: 1rem;
                            }
                            .card {
                                break-inside: avoid;
                            }
                            .action-buttons { display: none !important; }
                        }
                    </style>
                </head>
                <body>
                    <div class="watermark">okuanla.net</div>
                    <div class="header-line"></div>
                    <div class="main-wrapper">
                        <div class="main-container">
                            ${printContent.innerHTML}
                        </div>
                    </div>
                </body>
                </html>
            `);
            
            printWindow.document.close();
            printWindow.focus();
            
            setTimeout(() => {
                printWindow.print();
            }, 500);
        });
    }
}

// Initialize tooltips
document.addEventListener('DOMContentLoaded', function() {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
});

// Update the button text in the form submission handler
document.addEventListener('DOMContentLoaded', function() {
    const submitButton = document.querySelector('#textForm button[type="submit"]');
    if (submitButton) {
        submitButton.innerHTML = '<i class="fas fa-book me-2"></i>Generate Text';
    }
});
