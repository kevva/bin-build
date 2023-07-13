import {type ExecaReturnValue} from 'execa';

export type FileOptions = {
	strip: number; // Default 1
};

export type UrlOptions = {
	strip: number; // Default 1
	extract: boolean; // Default true
};

export function directory(dir: string, cmd: string[]): Promise<Array<ExecaReturnValue<string>>>;
export function file(file: string, cmd: string[], options: FileOptions): Promise<Array<ExecaReturnValue<string>>>;
export function url(file: string, cmd: string[], options: UrlOptions): Promise<Array<ExecaReturnValue<string>>>;
