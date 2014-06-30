var app = require('derby').createApp(module)
  // .use(require('derby-ui-boot'))
  .use(require('../../ui'))

var _ = require('lodash');

// ROUTES //

app.get('/', function(page, model, params, next) 
{
  var userQuery = model.query('user', {});

  // Get the inital data and subscribe to any updates
  model.subscribe(userQuery, function(err) 
  {
    if (err) return next(err);
    model.start('totKvarg', '_page.totalKvarg', '_page.users');
    userQuery.ref('_page.users');
    page.render('tracker');
  });
});

app.get('/users', function(page, model, params, next) 
{
  var userQuery = model.query('user', {});

  model.subscribe(userQuery, function(err) 
  {
    if (err) return next(err);

    userQuery.ref('_page.users');
    page.render('users');
  });
});

// CONTROLLER FUNCTIONS //

app.fn('user.remove', function(e, el) 
{
    var user = this.model.at(el).get();
    this.model.del('user.' + user.id);
});

app.fn('user.add', function(e, el) 
{
    var newUser = this.model.del('_page.newUser');
    if(!newUser || !newUser.kvargCount) {
        return;
    }

    newUser.kvargCount = parseInt(newUser.kvargCount, 10);
    this.model.add('user', newUser);
});

app.fn('user.inc', function(e, el)
{
    this.model.at(el).increment('kvargCount', 1);
});

app.fn('user.dec', function(e, el)
{
    this.model.at(el).increment('kvargCount', -1);
});

// REACTIVE FUNCTIONS //

app.on('model', function(model) 
{
  model.fn('totKvarg', function(users) {
    return _.reduce(users, function(acc, user) {
      return !!user ? acc + parseInt(user.kvargCount, 10) : 0; 
    }, 0);
  });
});

// VIEW HELPERS //

app.view.fn({
  multiply: function(arg1, arg2)
  {
    return arg1 * arg2;
  },

  belowLimit: function(user)
  {
    return user.kvargCount <= -2;
  }
});
