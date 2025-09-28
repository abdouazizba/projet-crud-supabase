//import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://xsmowalsnvvojlheddhj.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhzbW93YWxzbnZ2b2psaGVkZGhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5OTQwNjEsImV4cCI6MjA3NDU3MDA2MX0.nT38iGamH1vOweXE2yhxg1VclzUJNBqgf849vPgnLWU'
// Create a single supabase client for interacting with your database
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY)

// Gestion de la modale d'authentification
document.addEventListener('DOMContentLoaded', function() {

    const authModal = document.getElementById('authModal');
    const openLoginModal = document.getElementById('openLoginModal');
    const closeAuthModal = document.getElementById('closeAuthModal');
    const authTabs = document.querySelectorAll('.auth-tab');
    const authForms = document.querySelectorAll('.auth-form');
    const switchToRegister = document.getElementById('switchToRegister');
    const switchToLogin = document.getElementById('switchToLogin');
    const authTitle = document.getElementById('authTitle');
    const clauseSuccessMessage = document.getElementById('closesuccessMessage');
    const profileSection = document.getElementById('profileSection');
    const profileBtn = document.getElementById('profileBtn');
    const homeSection = document.getElementById('home-section');
    const linktohome = document.getElementById('linktohome');

    
    // Fonction pour afficher une section et cacher les autres
    function showSection(sectionToShow) {
        // Cacher toutes les sections
        homeSection.classList.add('hidden');
        profileSection.classList.add('hidden');
        // Afficher la section demandée
        sectionToShow.classList.remove('hidden');
    }

    // navigation vers page home
    linktohome.addEventListener('click', function(e) {
        e.preventDefault();
        showSection(homeSection);
    });

    // Ouvrir la modale
    openLoginModal.addEventListener('click', function() {
        authModal.style.display = 'flex';
        document.body.style.overflow = 'hidden'; // Empêcher le défilement
    });

    // Fermer la modale
    closeAuthModal.addEventListener('click', function() {
        authModal.style.display = 'none';
        document.body.style.overflow = 'auto'; // Rétablir le défilement
    });
    
    // Fermer la modale en cliquant à l'extérieur
    authModal.addEventListener('click', function(e) {
        if (e.target === authModal) {
            authModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });

    // Changer d'onglet
    authTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            
            // Mettre à jour les onglets actifs
            authTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // Mettre à jour les formulaires actifs
            authForms.forEach(form => {
                form.classList.remove('active');
                if (form.id === `${targetTab}Form`) {
                    form.classList.add('active');
                }
            });
            
            // Mettre à jour le titre
            authTitle.textContent = targetTab === 'login' ? 'Connexion' : 'Créer un compte';
        });
    });

    // Basculer vers l'inscription
    switchToRegister.addEventListener('click', function(e) {
        e.preventDefault();
        authTabs.forEach(tab => {
            if (tab.getAttribute('data-tab') === 'register') {
                tab.click();
            }
        });
    });

    // Basculer vers la connexion
    switchToLogin.addEventListener('click', function(e) {
        e.preventDefault();
        authTabs.forEach(tab => {
            if (tab.getAttribute('data-tab') === 'login') {
                tab.click();
            }
        });
    });

    // Formulaire d'inscription CORRIGÉ
    async function signUp(email, password, username) {
        try {
            // Inscription avec Supabase (sans le champ username qui n'existe pas)
            const { data, error } = await supabase.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: {
                        username: username
                    }
                }
            });
            
            if (error) throw error;
            
            // Créer le profil utilisateur après l'inscription
            if (data.user) {
                const { error: profileError } = await supabase
                    .from('profiles')
                    .upsert({
                        id: data.user.id,
                        username: username,
                        email: email,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    });
                
                if (profileError) {
                    console.error('Erreur création profil:', profileError);
                }
            }
            
            return data;
        } catch (error) {
            throw error;
        }
    }

    document.getElementById('registerForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        const username = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('registerConfirmPassword').value;
        
        if (password !== confirmPassword) {
            alert('Les mots de passe ne correspondent pas.');
            return;
        } else if (password.length < 6) {
            alert('Le mot de passe doit contenir au moins 6 caractères.');
            return;
        } else if (username.length < 3) {
            alert('Le nom d\'utilisateur doit contenir au moins 3 caractères.');
            return;
        }

        // Procéder à l'inscription
        try {
            const result = await signUp(email, password, username);
            alert(`Inscription réussie pour ${username}. Veuillez vérifier votre email pour confirmer votre compte.`);
            authModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        } catch (error) {
            console.error('Erreur lors de l\'inscription :', error);
            alert('Erreur lors de l\'inscription: ' + error.message);
        }
    });

    // Fonction de connexion 
   async function signIn(email, password) {
    try {
        console.log('Tentative de connexion avec:', { email, password });
        
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email.trim().toLowerCase(), // Normaliser l'email
            password: password
        });
        
        console.log('Réponse de Supabase:', { data, error });


        if (error) {
            if (error.message.includes("Invalid login credentials")) {
                alert("Adresse email ou mot de passe incorrect.");
            } else if (error.message.includes("Email not confirmed")) {
                alert("Veuillez confirmer votre adresse email avant de vous connecter.");
            } else {
                alert("Erreur lors de la connexion : " + error.message);
            }
            return null;
        }

        console.log('Connexion réussie:', data);
        return data;
    } catch (err) {
        console.error("Erreur inattendue :", err);
        alert("Une erreur inattendue est survenue.");
        return null;
    }
}

    document.getElementById('loginForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        // Validation pour authentification
        if (!email || !password) {
            alert('Veuillez remplir tous les champs.');
            return;
        }
        
        // Vérifier le format de l'email
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email)) {
            alert('Veuillez entrer une adresse email valide.');
            return;
        }
        
        // Afficher un indicateur de chargement
        const submitBtn = this.querySelector('.submit-btn');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Connexion...';
        submitBtn.disabled = true;

        // Procéder à l'authentification
        const data = await signIn(email, password);

        // Réactiver le bouton
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;

       if (data) {
            const username = data.user.email.split('@')[0];
            console.log(`Bienvenue ${username} ! Vous êtes maintenant connecté.`);
           const authCard = document.querySelector('.auth-card');
            authCard.innerHTML = `
                <div class="success-simple">
                    <div class="success-check">✓</div>
                    <h3>Connexion réussie</h3>
                    <p>Bienvenue ${username} ! Vous êtes maintenant connecté.</p>
                    <button class="btn-ok" id="closeSuccessBtn">OK</button>
                </div>
            `;
            
            // CORRECTION : Ajouter l'écouteur pour le bouton OK
            document.getElementById('closeSuccessBtn').addEventListener('click', function() {
                console.log('Bouton OK cliqué - fermeture modale');
                authModal.style.display = 'none';
                document.body.style.overflow = 'auto';
            });
            
            // Fermer automatiquement après 2 secondes
            setTimeout(() => {
                console.log('Fermeture en cours...');
                authModal.style.display = 'none';
                document.body.style.overflow = 'auto';
                console.log('État après fermeture:', {
                    modalDisplay: authModal.style.display,
                    modalVisible: window.getComputedStyle(authModal).display
                });        
            }, 7000);
        }
    });

    // Gestion de l'état d'authentification 
    supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('Auth state changed:', event);
        console.log('Session actuelle:', session);
        
        if (event === 'SIGNED_IN' && session) {
            const user = session.user;
            const username = user.email ? user.email.split('@')[0] : 'Utilisateur';
            console.log(`Utilisateur connecté: ${username} (ID: ${user.id})`);
            

            const authButtons = document.querySelector('.auth-buttons');
            authButtons.innerHTML = `
                <button class="profile-btn bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 px-4 py-2 rounded-lg font-medium transition" id="profileBtn">
                    <i class="fas fa-user-circle mr-2"></i>${username}
                </button>
                <button class="logout-btn bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg font-medium transition" id="logoutBtn">
                    <i class="fas fa-sign-out-alt mr-2"></i>Déconnexion
                </button>
            `;
            
            // Écouteur pour le bouton profil
            document.getElementById('profileBtn').addEventListener('click', async function() {
                authModal.style.display = 'none';
                document.body.style.overflow = 'auto';
                showSection(profileSection);
                const user = (await supabase.auth.getUser()).data.user;
                if (user) {
                    await loadUserProfile(user.id);
                }
            });
            
            // Événement pour le bouton de déconnexion
            document.getElementById('logoutBtn').addEventListener('click', async () => {
                const { error } = await supabase.auth.signOut();
                if (error) {
                    console.error('Erreur lors de la déconnexion :', error);
                } else {
                    window.location.reload();
                }
            });
                        
        } else if (event === 'SIGNED_OUT') {
            const authButtons = document.querySelector('.auth-buttons');
            authButtons.innerHTML = `
                <button class="login-btnbg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 px-4 py-2 rounded-lg font-medium transition" id="openLoginModal">
                    <i class="fas fa-sign-in-alt mr-2"></i>Se connecter
                </button>
            `;
            document.getElementById('openLoginModal').addEventListener('click', function() {
                authModal.style.display = 'flex';
                document.body.style.overflow = 'hidden';
            });
            
            // Revenir à la section accueil
            showSection(homeSection);
        }
});

async function loadUserProfile(userId) {
    try {
        console.log('Chargement du profil pour:', userId);
        
        //Récupérer l'email depuis l'authentification Supabase
        const { data: { user } } = await supabase.auth.getUser();
        const userEmail = user.email;
        const defaultUsername = userEmail.split('@')[0];

        console.log('Email depuis auth:', userEmail);

        //Récupérer le profil depuis votre table (seulement les colonnes qui existent)
        const { data: profile, error } = await supabase
            .from('profiles')
            .select('username, bio, updated_at') // SEULEMENT les colonnes de votre table
            .eq('id', userId)
            .single();

        if (error) {
            console.log('Profil non trouvé ou erreur:', error);
            
            // Créer un profil avec uniquement les champs de votre table
            const { data: newProfile, error: createError } = await supabase
                .from('profiles')
                .insert({
                    id: userId,
                    username: defaultUsername,
                    bio: '',
                    updated_at: new Date().toISOString()
                })
                .select()
                .single();

            if (createError) {
                console.error('Erreur création profil:', createError);
                // Afficher quand même les données de base
                displayProfileData({}, userEmail);
            } else {
                console.log('Nouveau profil créé:', newProfile);
                displayProfileData(newProfile, userEmail);
            }
        } else {
            console.log('Profil trouvé:', profile);
            displayProfileData(profile, userEmail);
        }

    } catch (error) {
        console.error('Erreur lors du chargement du profil:', error);
    }
}

// Fonction pour afficher les données dans le formulaire
function displayProfileData(profile, userEmail) {
    // Remplir les champs du formulaire
    document.getElementById('username').value = profile.username || userEmail.split('@')[0] || '';
    document.getElementById('email').value = userEmail || ''; // Email vient de l'auth
    document.getElementById('bio').value = profile.bio || '';
    
    // Le champ full_name n'existe pas dans votre table, donc on le laisse vide
    document.getElementById('fullName').value = '';

    // Mettre à jour les dates
    document.getElementById('memberSince').textContent = 'Aujourd\'hui'; // Pas de created_at dans votre table
    document.getElementById('lastUpdate').textContent = profile.updated_at 
        ? new Date(profile.updated_at).toLocaleDateString('fr-FR')
        : 'Jamais';

    console.log('Formulaire rempli avec:', {
        username: profile.username || userEmail.split('@')[0],
        email: userEmail,
        bio: profile.bio
    });
}
        // Mettre à jour les dates du profil
        function updateProfileDates(profile) {
            const memberSinceEl = document.getElementById('memberSince');
            const lastUpdateEl = document.getElementById('lastUpdate');

            if (memberSinceEl) {
                memberSinceEl.textContent = profile.created_at 
                    ? new Date(profile.created_at).toLocaleDateString('fr-FR')
                    : new Date().toLocaleDateString('fr-FR');
            }

            if (lastUpdateEl) {
                lastUpdateEl.textContent = profile.updated_at 
                    ? new Date(profile.updated_at).toLocaleDateString('fr-FR')
                    : 'Jamais';
            }
        }

    // Gestion du formulaire de profil
    if (document.getElementById('profileForm')) {
        document.getElementById('profileForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const user = (await supabase.auth.getUser()).data.user;
            if (!user) return;

            const username = document.getElementById('username').value;
            const fullName = document.getElementById('fullName').value;
            const bio = document.getElementById('bio').value;

            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .upsert({
                        id: user.id,
                        username: username,
                        bio: bio,
                        updated_at: new Date().toISOString()
                    });

                if (error) throw error;

                alert('Profil mis à jour avec succès!');
            } catch (error) {
                console.error('Erreur lors de la mise à jour:', error);
                alert('Erreur lors de la mise à jour du profil: ' + error.message);
            }
        });
    }

    // Annuler les modifications
    if (document.getElementById('cancelBtn')) {
        document.getElementById('cancelBtn').addEventListener('click', () => {
            window.location.reload();
        });
    }

    function setActiveNav(btn) {
        document.querySelectorAll('.profile-btn, .login-btn').forEach(b => b.classList.remove('active'));
        if (btn) btn.classList.add('active');
    }

    // Initialisation
    showSection(homeSection);
});