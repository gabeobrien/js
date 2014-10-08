var UserJoinController = FormController.extend({
	elements: {
		'input[name=username]': 'inp_username',
		'input[name=password]': 'inp_password',
		'input[name=confirm]': 'inp_confirm',
		'input[name=promo]': 'inp_promo',
		'div.promo': 'promo_section'
	},

	events: {
		'click a[href=#open-promo]': 'open_promo',
		'click .button.join': 'submit',
		'click .button.confirm': 'finalize'
	},

	model: false,
	promo: null,

	buttons: false,
	title: 'Join',
	formclass: 'user-join',

	init: function()
	{
		this.parent();

		// check for promo codes
		var check_promo = function()
		{
			var promo = localStorage.promo;
			if(promo && this.inp_promo.get('value') == '')
			{
				this.inp_promo.set('value', promo);
				var open = this.el.getElement('a.open-promo');
				if(open) open.click();
			}
			check_promo.delay(500, this);
		}.bind(this);
		check_promo();
	},

	render: function()
	{
		var content = view.render('users/join', {
			enable_promo: config.enable_promo,
			promo: localStorage.promo
		});
		this.html(content);
		if(this.promo_section && !this.promo_section.hasClass('open'))
		{
			this.promo_section.set('slide', {duration: 250, mode: 'horizontal'});
			this.promo_section.get('slide').hide();
		}
		(function() { this.inp_username.focus(); }).delay(100, this);
	},

	render_confirm: function()
	{
		var content = view.render('users/join-confirm', {
		});
		this.html(content);
	},

	submit: function(e)
	{
		if(e) e.stop();
		var username = this.inp_username.get('value');
		var password = this.inp_password.get('value');
		var pconfirm = this.inp_confirm.get('value');
		var promo = this.inp_promo.get('value');

		if(password != pconfirm)
		{
			barfr.barf('Your password does not match the confirmation.');
			this.inp_password.focus();
			return false;
		}

		if(password.length < 4)
		{
			barfr.barf('We don\'t mean to tell you your business, but a password less than four characters won\'t cut it. Try again.');
			this.inp_password.focus();
			return false;
		}

		if(password.toLowerCase() == 'password')
		{
			barfr.barf('You want to secure all of your data using <em>that</em> password? Be our guest...');
		}

		this.submit.disabled = true;

		this.user = new User({
			username: username,
			password: password
		});

		this.promo = promo;
		this.render_confirm();
	},

	finalize: function(e)
	{
		if(e) e.stop();

		turtl.loading(true);
		this.user.join({
			promo: this.promo,
			success: function(userdata) {
				var data = user.toJSON();
				data.id = userdata.id;
				turtl.user.set({
					username: user.get('username'),
					password: user.get('password')
				});
				turtl.user.login(data);
				turtl.loading(false);
				turtl.route('/');
			}.bind(this),
			error: function() {
				turtl.loading(false);
				this.submit.disabled = false;
			}.bind(this)
		});
	},

	open_promo: function(e)
	{
		if(e) e.stop();
		if(!this.promo_section) return;
		e.target.dispose();
		this.promo_section.addClass('open');
		this.promo_section.get('slide').slideIn();
	}
});
