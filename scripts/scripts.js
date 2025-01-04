document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('nav ul li a');

    navLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            event.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    const contactForm = document.getElementById('contact-form');

    contactForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const message = document.getElementById('message').value;

        try {
            const response = await fetch('/api/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, email, message })
            });

            if (response.ok) {
                alert('Form submitted successfully!');
                fetchSubmissions();
            } else {
                alert('There was an error submitting the form. Please try again later.');
            }
        } catch (error) {
            alert('There was an error submitting the form. Please try again later.');
        }
    });

    async function fetchSubmissions() {
        try {
            const response = await fetch('/api/submissions');
            const submissions = await response.json();
            displaySubmissions(submissions);
        } catch (error) {
            console.error('Error fetching submissions:', error);
        }
    }

    function displaySubmissions(submissions) {
        const tableBody = document.querySelector('#submissions-table tbody');
        tableBody.innerHTML = '';
        submissions.forEach(submission => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${submission.id}</td>
                <td>${submission.api.substring(0, 3)}...</td>
                <td>${submission.name.substring(0, 3)}...</td>
                <td>${submission.email.substring(0, 3)}...</td>
                <td>${submission.message.substring(0, 3)}...</td>
                <td>${new Date(submission.timestamp).toLocaleString()}</td>
            `;
            tableBody.appendChild(row);
        });
    }

    fetchSubmissions();
});
