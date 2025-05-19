let state = [];
let currentStep = 0;
let intervalId = null;

function toggleBeat(id) {
    const button = document.getElementById(id);
    const isActive = button.style.backgroundColor === "steelblue";

    button.style.backgroundColor = isActive ? "#dedede" : "steelblue";

    if (isActive) {
        state = state.filter(item => item !== id);
    } else {
        state.push(id);
    }

    console.log(state);
}

function clearAll() {
    const elements = document.getElementsByClassName('beat');
    for (let btn of elements) {
        btn.style.backgroundColor = "#dedede";
    }
    state = [];
}

function continueBeat() {
    for (let i = 0; i < 20; i++) {
        document.getElementById(`step-${i}`).style.backgroundColor = "#eee";
    }

    document.getElementById(`step-${currentStep}`).style.backgroundColor = "gray";

    for (let i = 0; i < 4; i++) {
        const id = `button-${i}-${currentStep}`;
        if (state.includes(id)) {
            const sound = new Audio(`/sounds/${getSoundName(i)}.ogg`);
            sound.play();
        }
    }

    currentStep = (currentStep + 1) % 20;
}

function getSoundName(i) {
    const soundNames = ["OpenHat", "ClosedHat", "Clap", "Kick"];
    return soundNames[i] || "Clap";
}

function startBeat() {
    if (intervalId === null) {
        intervalId = setInterval(continueBeat, 150);
    }
}

function stopBeat() {
    if (intervalId !== null) {
        clearInterval(intervalId);
        intervalId = null;
    }

    for (let i = 0; i < 20; i++) {
        document.getElementById(`step-${i}`).style.backgroundColor = "#eee";
    }

    currentStep = 0;
}

function saveBeat() {
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = '/save_beat';
    form.innerHTML = `<input type="hidden" name="pattern" value='${JSON.stringify(state)}'>`;
    document.body.appendChild(form);
    form.submit();
}

function loadSavedBeat(beatId) {
    fetch(`/load_beat/${beatId}`)
        .then(response => response.json())
        .then(data => {
            clearAll();

            state = data.pattern;
            currentStep = 0;

            data.pattern.forEach(id => {
                document.getElementById(id).style.backgroundColor = "gray";
            });

            if (intervalId === null) {
                startBeat();
            }
        })
        .catch(error => {
            console.error('Error loading beat:', error);
        });
}

function deleteBeat(beatId) {
    fetch(`/delete_beat/${beatId}`, {
        method: 'POST'
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === "Beat deleted successfully") {
            const beatElement = document.querySelector(`a[href='#'][onclick="loadSavedBeat(${beatId}); return false;"]`);
            if (beatElement) {
                beatElement.parentNode.remove();
            }
        }
    })
    .catch(error => {
        console.error('Error deleting beat:', error);
    });
}
