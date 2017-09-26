#! /usr/bin/env node

import options from './lib/extractArgs';
import Main from './src';

const ins = new Main(options);

ins.start();
