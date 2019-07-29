import { Options } from './interfaces/options';

const parsers = {
  netscape: require('./parsers/netscape'),
};

const DEFAULT_OPTIONS: Options = { parser: 'netscape' };

export = (code: string, options: Options = DEFAULT_OPTIONS) => {
  const parser = parsers[options.parser];

  if (!parser) throw new Error(`Parser ${options.parser} doesn't exist.`);

  if (!parser.canParse(code)) {
    throw new Error(`Parser ${options.parser} couldn't parse given HTML code.`);
  }

  return parser.parse(code);
};
