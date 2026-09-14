import test from 'node:test';
import assert from 'node:assert/strict';
import {safeUrl,eventDate,money} from '../src/lib/safe.js';
test('CMS URLs reject script, protocol-relative and data payloads',()=>{
 for(const url of ['javascript:alert(1)','data:text/html,<script>','//evil.test','file:///etc/passwd','vbscript:alert(1)'])assert.equal(safeUrl(url),'');
 assert.equal(safeUrl('https://example.com/path'),'https://example.com/path');
 assert.equal(safeUrl('/assets/logo.png'),'/assets/logo.png');
 assert.equal(safeUrl('#historia'),'#historia');
});
test('Event dates stay on their calendar day in Brazil',()=>{assert.equal(eventDate('2026-09-14'),'14 de setembro de 2026');assert.equal(eventDate(''),'Data a definir')});
test('Unconfigured prices are not presented as free admission',()=>{assert.equal(money(null),'Valores em breve');assert.equal(money(''),'Valores em breve');assert.match(money(0),/0,00/)});
