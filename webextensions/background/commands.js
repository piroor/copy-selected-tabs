/*
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/
'use strict';

var gSelectedTabs = {};
var gTargetWindow = null;

function clearSelection(aWindowId, aState) {
  gSelectedTabs = {};
  gTargetWindow = null;
  browser.runtime.sendMessage(kTST_ID, {
    type:   kTSTAPI_REMOVE_TAB_STATE,
    tabs:   '*',
    window: aWindowId,
    state:  aState || 'selected'
  });
}

function setSelection(aTabs, aSelected, aState) {
  if (!Array.isArray(aTabs))
    aTabs = [aTabs];

  //console.log('setSelection ', ids, `${aState}=${aSelected}`);
  if (aSelected) {
    for (let tab of aTabs) {
      gSelectedTabs[tab.id] = tab;
    }
  }
  else {
    for (let tab of aTabs) {
      delete gSelectedTabs[tab.id];
    }
  }
  browser.runtime.sendMessage(kTST_ID, {
    type:  aSelected ? kTSTAPI_ADD_TAB_STATE : kTSTAPI_REMOVE_TAB_STATE,
    tabs:  aTabs.map(aTab => aTab.id),
    state: aState || 'selected'
  });
}

async function invertSelection() {
  var tabs = gTargetWindow ?
               await browser.tabs.query({ windowId: gTargetWindow }) :
               (await browser.windows.getCurrent({ populate: true })).tabs ;
  var selectedIds = Object.keys(gSelectedTabs);
  gSelectedTabs = {};
  var newSelected = [];
  var oldSelected = [];
  for (let tab of tabs) {
    let toBeSelected = selectedIds.indexOf(tab.id) < 0;
    if (toBeSelected) {
      gSelectedTabs[tab.id] = tab;
      newSelected.push(tab);
    }
    else {
      oldSelected.push(tab);
    }
  }
  setSelection(oldSelected, false);
  setSelection(newSelected, true);
}
