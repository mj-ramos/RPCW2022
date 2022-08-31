import json

f = open('arq-son-EVO-ANTIGO.json', encoding="utf8")
lines = f.readlines()
f.close()
i = 0

for line in lines:
    lines[i] = json.loads(line)
    lines[i]['id'] = i #adição de id artificial
    if 'musico' in lines[i]: 
        if (lines[i]['musico'] == 'por quem?') or (lines[i]['musico'] == '-'):
            del lines[i]['musico']
    i+=1

out_file = open('arq-son-EVO.json','w', encoding="utf8")
json.dump({"musicas" : lines}, out_file, indent=4, ensure_ascii=False)