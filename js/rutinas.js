document.addEventListener('DOMContentLoaded', () => {
    const calendarGrid = document.getElementById('calendarGrid');
    const currentMonthYearElem = document.getElementById('currentMonthYear');
    const prevMonthBtn = document.getElementById('prevMonth');
    const nextMonthBtn = document.getElementById('nextMonth');
    const routineDetails = document.getElementById('routineDetails');
    const selectedDateElem = document.getElementById('selectedDate');
    const routineList = document.getElementById('routineList');
    const addRoutineBtn = document.getElementById('addRoutineBtn');
    const routineModal = document.getElementById('routineModal');
    const closeButton = document.querySelector('.close-button');
    const routineForm = document.getElementById('routineForm');
    const routineNameInput = document.getElementById('routineName');
    const exerciseSearchInput = document.getElementById('exerciseSearch');
    const searchExercisesBtn = document.getElementById('searchExercisesBtn');
    const searchResultsList = document.getElementById('searchResults');
    const selectedExercisesList = document.getElementById('selectedExercisesList');

    let currentMonth = new Date().getMonth();
    let currentYear = new Date().getFullYear();
    let selectedDay = null; // Almacena la fecha seleccionada
    let routines = JSON.parse(localStorage.getItem('routines')) || {}; // { 'YYYY-MM-DD': [{ name: 'Rutina A', exercises: [...] }] }
    let currentSelectedExercises = []; // Ejercicios seleccionados para la rutina actual en el modal

    // *** API ExerciseDB ***
    const EXERCISE_API_KEY = 'b4668a260fmsha2d95b4c5f50d4ep19c5b5jsn4d1b057a82d5'; // ¡Reemplaza con tu clave!
    const EXERCISE_API_HOST = 'exercisedb.p.rapidapi.com';

    async function fetchExercises(query) {
        //if (!EXERCISE_API_KEY || EXERCISE_API_KEY === 'b4668a260fmsha2d95b4c5f50d4ep19c5b5jsn4d1b057a82d5') {
        //    alert('Por favor, ingresa tu clave de API de ExerciseDB en script.js');
        //    return [];
        //}

        const url = `https://${EXERCISE_API_HOST}/exercises/name/${query}`;
        const options = {
            method: 'GET',
            headers: {
                'X-RapidAPI-Key': EXERCISE_API_KEY,
                'X-RapidAPI-Host': EXERCISE_API_HOST
            }
        };

        try {
            const response = await fetch(url, options);
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }
            const data = await response.json();
            console.log("API Response:", data); // Para depuración
            return data;
        } catch (error) {
            console.error('Error fetching exercises:', error);
            alert('Error al buscar ejercicios. Asegúrate de que tu clave API sea correcta y el host.');
            return [];
        }
    }

    // *** Funciones del Calendario ***

    function renderCalendar() {
        calendarGrid.innerHTML = ''; // Limpiar días anteriores
        const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay(); // 0 (Dom) - 6 (Sáb)
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

        currentMonthYearElem.textContent = new Date(currentYear, currentMonth).toLocaleString('es-ES', {
            month: 'long',
            year: 'numeric'
        });

        // Días del mes anterior (para rellenar el inicio de la cuadrícula)
        for (let i = 0; i < firstDayOfMonth; i++) {
            const dayElem = document.createElement('div');
            dayElem.classList.add('calendar-day', 'other-month');
            calendarGrid.appendChild(dayElem);
        }

        // Días del mes actual
        for (let day = 1; day <= daysInMonth; day++) {
            const dayElem = document.createElement('div');
            dayElem.classList.add('calendar-day', 'current-month');
            dayElem.textContent = day;
            dayElem.dataset.date = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

            // Marcar días con rutinas
            const dateKey = dayElem.dataset.date;
            if (routines[dateKey] && routines[dateKey].length > 0) {
                dayElem.classList.add('has-routine');
            }

            dayElem.addEventListener('click', () => {
                // Eliminar selección anterior
                const previouslySelected = document.querySelector('.calendar-day.selected');
                if (previouslySelected) {
                    previouslySelected.classList.remove('selected');
                }
                // Seleccionar el día actual
                dayElem.classList.add('selected');
                selectedDay = dayElem.dataset.date;
                displayRoutineDetails(selectedDay);
            });
            calendarGrid.appendChild(dayElem);
        }

        // Si hay un día seleccionado, asegúrate de que siga resaltado después de renderizar
        if (selectedDay) {
            const reselectDay = document.querySelector(`.calendar-day[data-date="${selectedDay}"]`);
            if (reselectDay) {
                reselectDay.classList.add('selected');
            }
        }
    }

    function displayRoutineDetails(date) {
        selectedDateElem.textContent = new Date(date).toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        routineList.innerHTML = '';
        const dayRoutines = routines[date] || [];

        if (dayRoutines.length === 0) {
            routineList.innerHTML = '<li>No hay rutinas para este día.</li>';
        } else {
            dayRoutines.forEach((routine, index) => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <span>${routine.name}</span>
                    <div>
                        <button class="view-routine-btn" data-routine-index="${index}">Ver Ejercicios</button>
                        <button class="edit-routine-btn" data-routine-index="${index}">Editar</button>
                        <button class="delete-routine-btn" data-routine-index="${index}">Eliminar</button>
                    </div>
                `;
                routineList.appendChild(li);
            });
        }
        routineDetails.style.display = 'block'; // Mostrar la sección de detalles
    }

    function saveRoutines() {
        localStorage.setItem('routines', JSON.stringify(routines));
    }

    // *** Manejo de Eventos del Calendario ***

    prevMonthBtn.addEventListener('click', () => {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        renderCalendar();
        routineDetails.style.display = 'none'; // Ocultar detalles al cambiar de mes
        selectedDay = null; // Deseleccionar día
    });

    nextMonthBtn.addEventListener('click', () => {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        renderCalendar();
        routineDetails.style.display = 'none'; // Ocultar detalles al cambiar de mes
        selectedDay = null; // Deseleccionar día
    });

    addRoutineBtn.addEventListener('click', () => {
        if (!selectedDay) {
            alert('Por favor, selecciona un día en el calendario primero.');
            return;
        }
        // Limpiar el formulario y abrir modal
        routineNameInput.value = '';
        exerciseSearchInput.value = '';
        searchResultsList.innerHTML = '';
        selectedExercisesList.innerHTML = '';
        currentSelectedExercises = [];
        routineForm.dataset.editingIndex = ''; // Para saber si estamos editando
        routineModal.style.display = 'flex';
    });

    closeButton.addEventListener('click', () => {
        routineModal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target == routineModal) {
            routineModal.style.display = 'none';
        }
    });

    // *** Lógica del Modal de Rutinas ***

    searchExercisesBtn.addEventListener('click', async () => {
        const query = exerciseSearchInput.value.trim();
        if (query.length < 3) {
            alert('Por favor, introduce al menos 3 caracteres para buscar ejercicios.');
            return;
        }
        searchResultsList.innerHTML = '<li>Buscando...</li>';
        const exercises = await fetchExercises(query);
        searchResultsList.innerHTML = '';

        if (exercises.length === 0) {
            searchResultsList.innerHTML = '<li>No se encontraron ejercicios.</li>';
            return;
        }

        exercises.forEach(exercise => {
            const li = document.createElement('li');
            li.textContent = exercise.name;
            li.dataset.exerciseId = exercise.id; // Guardar el ID del ejercicio
            li.dataset.exerciseName = exercise.name;
            li.addEventListener('click', () => {
                addExerciseToSelected(exercise);
            });
            searchResultsList.appendChild(li);
        });
    });

    function addExerciseToSelected(exercise) {
        // Evitar duplicados simples (puedes mejorar esta lógica si necesitas más control)
        if (!currentSelectedExercises.some(ex => ex.id === exercise.id)) {
            currentSelectedExercises.push({ id: exercise.id, name: exercise.name });
            renderSelectedExercises();
        } else {
            alert('Este ejercicio ya ha sido añadido.');
        }
    }

    function renderSelectedExercises() {
        selectedExercisesList.innerHTML = '';
        currentSelectedExercises.forEach((exercise, index) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span>${exercise.name}</span>
                <button class="remove-selected-exercise" data-index="${index}">&times;</button>
            `;
            selectedExercisesList.appendChild(li);
        });

        document.querySelectorAll('.remove-selected-exercise').forEach(button => {
            button.addEventListener('click', (event) => {
                const indexToRemove = parseInt(event.target.dataset.index);
                currentSelectedExercises.splice(indexToRemove, 1);
                renderSelectedExercises();
            });
        });
    }

    routineForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const routineName = routineNameInput.value.trim();

        if (!routineName) {
            alert('El nombre de la rutina no puede estar vacío.');
            return;
        }

        if (currentSelectedExercises.length === 0) {
            alert('Por favor, selecciona al menos un ejercicio para la rutina.');
            return;
        }

        const newRoutine = {
            name: routineName,
            exercises: currentSelectedExercises
        };

        if (!routines[selectedDay]) {
            routines[selectedDay] = [];
        }

        const editingIndex = routineForm.dataset.editingIndex;
        if (editingIndex !== '') {
            // Editando una rutina existente
            routines[selectedDay][parseInt(editingIndex)] = newRoutine;
        } else {
            // Agregando una nueva rutina
            routines[selectedDay].push(newRoutine);
        }

        saveRoutines();
        displayRoutineDetails(selectedDay);
        renderCalendar(); // Para actualizar la marca de "tiene rutina"
        routineModal.style.display = 'none';
    });

    // Manejar eventos de editar y eliminar rutina
    routineList.addEventListener('click', (event) => {
        if (event.target.classList.contains('delete-routine-btn')) {
            const indexToDelete = parseInt(event.target.dataset.routineIndex);
            if (confirm('¿Estás seguro de que quieres eliminar esta rutina?')) {
                routines[selectedDay].splice(indexToDelete, 1);
                if (routines[selectedDay].length === 0) {
                    delete routines[selectedDay]; // Eliminar la entrada del día si no hay rutinas
                }
                saveRoutines();
                displayRoutineDetails(selectedDay);
                renderCalendar(); // Para actualizar la marca de "tiene rutina"
            }
        } else if (event.target.classList.contains('edit-routine-btn')) {
            const indexToEdit = parseInt(event.target.dataset.routineIndex);
            const routineToEdit = routines[selectedDay][indexToEdit];

            routineNameInput.value = routineToEdit.name;
            currentSelectedExercises = [...routineToEdit.exercises]; // Copiar los ejercicios
            renderSelectedExercises();
            routineForm.dataset.editingIndex = indexToEdit; // Guardar el índice para la edición
            routineModal.style.display = 'flex';
        } else if (event.target.classList.contains('view-routine-btn')) {
            const indexToView = parseInt(event.target.dataset.routineIndex);
            const routineToView = routines[selectedDay][indexToView];

            let exercisesHtml = routineToView.exercises.map(ex => `<li>${ex.name}</li>`).join('');
            alert(`Ejercicios de "${routineToView.name}":\n\n${exercisesHtml.replace(/<li>|<\/li>/g, '')}`); // Simple alert para mostrar
            // Idealmente, aquí abrirías otro modal o una sección para ver los detalles.
        }
    });


    // Inicializar el calendario al cargar la página
    renderCalendar();
});