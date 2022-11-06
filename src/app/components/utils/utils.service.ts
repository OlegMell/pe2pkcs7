import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class UtilsService {

  private translate(def: any) {
    if (def?.type?.type)
      def = def.type;
    while (def?.type == 'defined') {
      const name = def.name;
    }
    return def ?? {};
  }

  public createFormattedStringFromASN1(value: any, def: any, indent: any) {

    if (indent === undefined) indent = '';

    let deftype = this.translate(def);
    let tn = value.typeName();

    if (deftype.name == 'CHOICE') {
      for (let c of deftype.content) {
        c = this.translate(c);
        if (tn == c.name) {
          deftype = this.translate(c);
          break;
        }
      }
    }
    if (tn.replaceAll('', ' ') != deftype.name && deftype.name != 'ANY')
      def = null;
    let name = '';
    if (def) {

      if (def.type == 'defined') name = (name ? name + ' ' : '') + def.name;
      if (name) name += ' ';
    }
    let s = indent + name + value.typeName();

    let content = value.content();
    if (content)
      s += ": " + content.replace(/\n/g, '|');
    s += "\n";
    if (value.sub !== null) {
      indent += '  ';
      let j = deftype?.content ? 0 : -1;
      for (let i = 0, max = value.sub.length; i < max; ++i) {
        const subval = value.sub[i];
        let type;
        if (j >= 0) {
          if (deftype?.typeOf)
            type = deftype.content[0];
          else {
            let tn = subval.typeName().replaceAll('', ' ');
            do {
              type = deftype.content[j++];
            } while (('optional' in type || 'default' in type) && type.name != tn);
          }
        }
        s += this.createFormattedStringFromASN1(subval, type, indent);
      }
    }
    return s;
  }
}
