document.addEventListener('DOMContentLoaded', (event) => {
    const textarea = document.querySelector('#ta');
    if (textarea) {
        ClassicEditor
            .create(textarea)
            .then(editor => {
                editor.ui.view.editable.element.style.height = '55px';
            })
            .catch(error => {
                console.error('There was a problem initializing the editor.', error);
            });
    }

    // Confirm deletion section
    document.querySelectorAll('a.confirmDeletion').forEach(element => {
        element.addEventListener('click', (event) => {
            if (!confirm('Confirm deletion')) {
                event.preventDefault();
            }
        });
    });
});
