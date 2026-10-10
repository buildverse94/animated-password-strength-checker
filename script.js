
document.addEventListener('DOMContentLoaded', () => {
    const passwordInput = document.getElementById('passwordInput');
    const togglePasswordBtn = document.getElementById('togglePasswordBtn');
    const eyeIcon = document.getElementById('eyeIcon');
    const generateBtn = document.getElementById('generateBtn');
    const copyBtn = document.getElementById('copyBtn');

    const meterFill = document.getElementById('meterFill');
    const statusText = document.getElementById('statusText');
    const scorePercentage = document.getElementById('scorePercentage');
    const appCard = document.getElementById('appCard');

    const reqLength = document.getElementById('reqLength');
    const reqUpper = document.getElementById('reqUpper');
    const reqLower = document.getElementById('reqLower');
    const reqNumber = document.getElementById('reqNumber');
    const reqSymbol = document.getElementById('reqSymbol');

    const tipsSection = document.getElementById('tipsSection');
    const tipsList = document.getElementById('tipsList');
    const celebrationBox = document.getElementById('celebrationBox');
    const toast = document.getElementById('toast');

    // Evaluate password strength
    function evaluatePassword(pwd) {
        if (!pwd) {
            return {
                score: 0,
                level: 'Too Short',
                color: 'var(--color-very-weak)',
                checks: {
                    length: false,
                    upper: false,
                    lower: false,
                    number: false,
                    symbol: false
                },
                tips: ['Enter a password to begin analysis.']
            };
        }

        const checks = {
            length: pwd.length >= 8,
            upper: /[A-Z]/.test(pwd),
            lower: /[a-z]/.test(pwd),
            number: /[0-9]/.test(pwd),
            symbol: /[^A-Za-z0-9]/.test(pwd)
        };

        let rawScore = 0;

        if (pwd.length >= 8) rawScore += 20;
        if (pwd.length >= 12) rawScore += 15;
        if (pwd.length >= 16) rawScore += 10;

        if (checks.upper) rawScore += 15;
        if (checks.lower) rawScore += 10;
        if (checks.number) rawScore += 15;
        if (checks.symbol) rawScore += 15;

        const varietyCount = Object.values(checks).filter(Boolean).length;

        if (varietyCount >= 4) rawScore += 10;

        if (/(.)\1{2,}/.test(pwd)) {
            rawScore -= 15;
        }

        const score = Math.min(100, Math.max(0, rawScore));

        let level = 'Very Weak';
        let color = 'var(--color-very-weak)';

        if (score >= 85 && checks.length && varietyCount >= 4) {
            level = 'Very Strong';
            color = 'var(--color-success)';
        } else if (score >= 65) {
            level = 'Strong';
            color = 'var(--color-success)';
        } else if (score >= 45) {
            level = 'Medium';
            color = 'var(--color-medium)';
        } else if (score >= 25) {
            level = 'Weak';
            color = 'var(--color-weak)';
        }

        const tips = [];

        if (pwd.length < 8) {
            tips.push('Increase length to at least 8 characters.');
        } else if (pwd.length < 12) {
            tips.push('Aim for 12+ characters for enhanced protection.');
        }

        if (!checks.upper) tips.push('Add uppercase letters (A-Z).');
        if (!checks.lower) tips.push('Add lowercase letters (a-z).');
        if (!checks.number) tips.push('Include numbers (0-9).');
        if (!checks.symbol) tips.push('Include special symbols (!@#$%^&*).');

        if (/(.)\1{2,}/.test(pwd)) {
            tips.push('Avoid repeating identical characters consecutively.');
        }

        return { score, level, color, checks, tips };
    }

    // Update interface
    function updateUI() {
        const pwd = passwordInput.value;
        const result = evaluatePassword(pwd);

        meterFill.style.width = `${result.score}%`;
        meterFill.style.backgroundColor = result.color;

        document.documentElement.style.setProperty(
            '--color-current',
            result.color
        );

        statusText.textContent = result.level;
        scorePercentage.textContent = `(${result.score}%)`;

        toggleCheck(reqLength, result.checks.length);
        toggleCheck(reqUpper, result.checks.upper);
        toggleCheck(reqLower, result.checks.lower);
        toggleCheck(reqNumber, result.checks.number);
        toggleCheck(reqSymbol, result.checks.symbol);

        if (result.level === 'Very Strong') {
            tipsSection.style.display = 'none';
            celebrationBox.style.display = 'block';
            appCard.classList.add('very-strong-glow');
        } else {
            tipsSection.style.display = 'block';
            celebrationBox.style.display = 'none';
            appCard.classList.remove('very-strong-glow');

            tipsList.innerHTML = result.tips
                .map(tip => `<li>${tip}</li>`)
                .join('');
        }
    }

    // Update checklist status
    function toggleCheck(element, isValid) {
        if (!element) return;

        element.classList.toggle('valid', isValid);
    }

    // Generate a strong password
    function generateStrongPassword() {
        const charsUpper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
        const charsLower = 'abcdefghijkmnopqrstuvwxyz';
        const charsNum = '23456789';
        const charsSym = '!@#$%^&*()_+-=[]{}|;:,.<>?';

        let password = [
            charsUpper[Math.floor(Math.random() * charsUpper.length)],
            charsLower[Math.floor(Math.random() * charsLower.length)],
            charsNum[Math.floor(Math.random() * charsNum.length)],
            charsSym[Math.floor(Math.random() * charsSym.length)]
        ];

        const allChars = charsUpper + charsLower + charsNum + charsSym;
        const length = 16;

        for (let i = password.length; i < length; i++) {
            password.push(
                allChars[Math.floor(Math.random() * allChars.length)]
            );
        }

        // Shuffle password characters
        for (let i = password.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [password[i], password[j]] = [password[j], password[i]];
        }

        passwordInput.value = password.join('');
        updateUI();
    }

    // Copy password
    function copyToClipboard() {
        if (!passwordInput.value) {
            showToast('Please enter or generate a password first!');
            return;
        }

        const textArea = document.createElement('textarea');
        textArea.value = passwordInput.value;

        // Keep the temporary textarea out of the visible layout
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';

        document.body.appendChild(textArea);
        textArea.select();

        try {
            const copied = document.execCommand('copy');

            if (copied) {
                showToast('Password copied to clipboard!');
            } else {
                showToast('Failed to copy password.');
            }
        } catch (error) {
            showToast('Failed to copy password.');
        }

        document.body.removeChild(textArea);
    }

    // Show toast notification
    let toastTimeout;

    function showToast(message) {
        toast.querySelector('span').textContent = message;
        toast.classList.add('show');

        clearTimeout(toastTimeout);

        toastTimeout = setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    // Password visibility toggle using Font Awesome
    togglePasswordBtn.addEventListener('click', () => {
        const isPassword = passwordInput.type === 'password';

        passwordInput.type = isPassword ? 'text' : 'password';

        // Change icon 
        eyeIcon.classList.toggle('fa-eye', !isPassword);
        eyeIcon.classList.toggle('fa-eye-slash', isPassword);

        togglePasswordBtn.setAttribute(
            'aria-label',
            isPassword ? 'Hide password' : 'Show password'
        );

        togglePasswordBtn.setAttribute(
            'title',
            isPassword ? 'Hide Password' : 'Show Password'
        );
    });

    // Event listeners
    passwordInput.addEventListener('input', updateUI);
    generateBtn.addEventListener('click', generateStrongPassword);
    copyBtn.addEventListener('click', copyToClipboard);

    // Initial UI state
    updateUI();
});
