import axios from 'axios';

import patcher from './internals/patcher';
patcher.start();

import events from 'utils/events.js';
import Modal from 'utils/modal.js';
import storage from 'utils/storage.js';

if (!storage.get('bb_pluginData')) storage.set('bb_pluginData', { active: [], settings: {} }, true);
if (!storage.get('bb_themeData')) storage.set('bb_themeData', { active: [] }, true);

window.bb = {
    axios,
    events,
    Modal,
    storage,
    plugins: {
        list: [],
        settings: {},
        styles: {},
        pendingChanges: false
    },
    themes: {
        list: [],
        broken: [],
        reload: () => loadThemes(true)
    },
    patches: []
};

console.log('Defined global "bb" variable:', bb);

import loadThemes from 'internals/loadThemes.js';
import loadPlugins from './internals/loadPlugins';

setTimeout(() => loadThemes(), 0);
setTimeout(() => loadPlugins(), 0);