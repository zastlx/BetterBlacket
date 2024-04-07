import axios from 'axios';
import createPlugin from '#utils/createPlugin';

export default () => createPlugin({
    title: 'Advanced Opener',
    description: 'a better way to open packs.',
    authors: [{ name: 'Death', avatar: 'https://i.imgur.com/PrvNWub.png', url: 'https://villainsrule.xyz' }],
    styles: `
        .bb_openModal {
            font-family: "Nunito", sans-serif;
            font-size: 14px;
            height: 350px;
            width: 22vw;
            border: 4px solid #262626;
            background: #2f2f2f;
            position: absolute;
            bottom: 1vw;
            right: 1vw;
            border-radius: 10px;
            color: rgb(0, 0, 0);
            text-align: center;
            color: white;
            overflow: auto;
            padding: 2vw;
        } 

        .bb_openIcons {
            position: absolute;
            right: 1vw;
            top: 1vw;
            font-size: 1.5vw;
        }

        .bb_openIcon {
            cursor: pointer;
        }

        .bb_openTitle {
            font-size: 2vw;
            font-weight: 1000;
        }

        .bb_openedCount {
            font-weight: 800;
            font-size: 1.5vw;
            margin-top: 1vw;
            padding-bottom: 1vw;
        }

        .bb_opened {
            margin-top: 1.5vw;
            max-height: 12vw;
            overflow: auto;
            -ms-overflow-style: none;
            scrollbar-width: none;
        }    

        .bb_opened::-webkit-scrollbar {
            display: none;
        }

        .bb_openResult {
            font-size: 1.55vw;
            margin-top: 0.5vw;
            font-weight: 600;
        }

        .bb_openButtons {
            position: absolute;
            bottom: 1.25vw;
            display: flex;
            align-items: center;
            width: calc(100% - 4vw);
        }

        .bb_openButton {
            font-size: 20px;
            cursor: pointer;
            width: 100%;
            height: 2.6vw;
            border: 4px solid white;
            border-radius: 0.4vw;
            display: flex;
            justify-content: center;
            align-items: center;
        }
    `,
    onStart: () => {
        if (!location.pathname.startsWith('/market')) return;
        else console.log('Advanced Opener started!');

        bb.plugins.massopen = {};

        bb.plugins.massopen.start = async () => {
            let packModal = new bb.Modal({
                title: 'Mass Open',
                inputs: [{ placeholder: 'Pack' }],
                buttons: [{ text: 'Next' }, { text: 'Cancel' }]
            });

            let packResponse = await packModal.listen();
            if (packResponse.button !== '0') return;

            let pack = packResponse.inputs[0].value;
            if (!blacket.packs[pack]) return new bb.Modal({
                title: 'I cannot find that pack.',
                buttons: [{ text: 'Close' }]
            });

            let countModal = new bb.Modal({
                title: 'Mass Open',
                inputs: [{ placeholder: 'Quantity' }],
                buttons: [{ text: 'Next' }, { text: 'Cancel' }]
            });

            let countResponse = await countModal.listen();
            if (countResponse.button !== '0') return;

            let qty = Number(countResponse.inputs[0].value) || null;
            if (qty === NaN) return new bb.Modal({
                title: 'Invalid quantity.',
                buttons: [{ text: 'Close' }]
            });

            let cost = blacket.packs[pack].price * qty;
            if (blacket.user.tokens < cost) return new bb.Modal({
                title: 'You do not have enough tokens to open that many packs!',
                buttons: [{ text: 'Close' }]
            });

            let speedModal = new bb.Modal({
                title: 'Mass Open',
                description: 'note: default is 1.2k, recommended is around 1k',
                inputs: [{ placeholder: 'Speed' }],
                buttons: [{ text: 'Next' }, { text: 'Cancel' }]
            });

            let speedResponse = await speedModal.listen();
            if (speedResponse.button !== '0') return;

            let speed = Number(speedResponse.inputs[0].value);
            if (speed === NaN) return new bb.Modal({
                title: 'Invalid speed.',
                buttons: [{ text: 'Close' }]
            });

            let confirmModal = new bb.Modal({
                title: 'Mass Open',
                description: `Are you sure you want to open ${qty.toLocaleString()}x ${pack}? This will cost ${cost.toLocaleString()} tokens!`,
                buttons: [{ text: 'Start!' }, { text: 'Cancel' }]
            });

            let confirmResponse = await confirmModal.listen();
            if (confirmResponse.button !== '0') return;

            document.querySelector('.bb_openButton').innerText = 'Stop Opening';

            let opened = [];
            let openedCount = 0;

            let openPack = async () => {
                await axios.post('/worker3/open', { pack }).then((open) => {
                    if (open.data.error) return;
                    opened.push(open.data.blook);
                    openedCount++;
                    document.querySelector('.bb_openedCount').innerHTML = `${pack} | ${openedCount}/${qty} opened`;
                    document.querySelector('.bb_opened').insertAdjacentHTML('beforeend', `<div class="bb_openResult" style="color: ${blacket.rarities[blacket.blooks[open.data.blook].rarity].color};">${open.data.blook}</div>`);
                });
            };

            let interval = setInterval(() => {
                if (openedCount < qty) return openPack();

                clearInterval(interval);
                let count = {};
                opened.forEach(blook => count[blook] = (count[blook] || 0) + 1);
                alert(`Final Results:\n` + Object.entries(count).map((x) => `    ${x[1]} ${x[0]}`).join(`\n`));

                document.querySelector('.bb_openedCount').innerHTML = 'Opening ended!';
                document.querySelector('.bb_openButton').onclick = () => bb.plugins.massopen.start();
                document.querySelector('.bb_openButton').innerText = 'Start Opening';
            }, speed);

            document.querySelector('.bb_openButton').innerText = 'Stop Opening';
            document.querySelector('.bb_openButton').onclick = () => openedCount = qty;
        };

        document.body.insertAdjacentHTML('beforeend', `
            <div class="bb_openModal">
                <div class="bb_openIcons">
                    <i class="fas fa-arrows-up-down-left-right bb_openIcon" id="bb_openDragger"></i>
                    <i class="fas fa-x bb_openIcon" onclick="document.querySelector('.bb_openModal').remove()"></i>
                </div>
                <div class="bb_openTitle">Pack Opening</div>
                <div class="bb_openedCount">Waiting to open...</div>
                <hr>
                <div class="bb_opened"></div>
                <div class="bb_openButtons">
                    <div class="bb_openButton" onclick="bb.plugins.massopen.start()">Start Opening</div>
                </div>
            </div>
        `);

        let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
        let modal = document.querySelector('.bb_openModal');
        let dragger = document.querySelector('#bb_openDragger');

        dragger.onmousedown = ((e) => {
            e.preventDefault();

            pos3 = e.clientX;
            pos4 = e.clientY;

            document.onmouseup = (() => {
                document.onmouseup = null;
                document.onmousemove = null;
            });

            document.onmousemove = ((e) => {
                e.preventDefault();
                pos1 = pos3 - e.clientX;
                pos2 = pos4 - e.clientY;
                pos3 = e.clientX;
                pos4 = e.clientY;
                let top = (modal.offsetTop - pos2) > 0 ? (modal.offsetTop - pos2) : 0;
                let left = (modal.offsetLeft - pos1) > 0 ? (modal.offsetLeft - pos1) : 0;
                if (top + modal.offsetHeight + 15 <= window.innerHeight) modal.style.top = top + 'px';
                if (left + modal.offsetWidth + 15 <= window.innerWidth) modal.style.left = left + 'px';
            });
        });

        window.onresize = () => modal.style.top = modal.style.left = '';
    }
});