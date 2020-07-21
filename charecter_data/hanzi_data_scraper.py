
import requests
from bs4 import BeautifulSoup
import pandas as pd
from tqdm import tqdm
import re

def getChinese(context):
    try:
        context=context.text
        filtrate = re.compile(u'[^\u4E00-\u9FA5]') # non-Chinese unicode range
        context = filtrate.sub(r'', context) # remove all non-Chinese characters
        return context
    except:
        return ''

def get_example_sentances(target_charecter):
  try:
    response =requests.get(f'https://www.purpleculture.net/dictionary-details/?word={target_charecter}')
    soup = BeautifulSoup(response.text, 'html.parser')

    # get Chinese Sentances
    contents =soup.findAll("span", {"class": "samplesen"})
    chinese_sentances =[]
    for content in contents:
      chinese_sentances.append(''.join([getChinese(x) for x in content]))

    # get English Sentances
    english_sentances =[]

    for english_sentance in soup.findAll("div", {"class": "sample_en"}):
      english_sentances.append(english_sentance.text)

    assert len(english_sentances)==len(chinese_sentances)
    sentance_dict ={}
    for j in range(len(english_sentances)):
      sentance_dict[f'zh_sentance_{j}' ] =chinese_sentances[j]
      sentance_dict[f'eng_sentance_{j}' ] =english_sentances[j]
    return pd.Series(sentance_dict)
  except:
    sentance_dict ={'zh_sentance_0' :'',
                   'eng_sentance_0' :'',
                   'zh_sentance_1' :'',
                   'eng_sentance_1' :'',
                   'zh_sentance_2' :'',
                   'eng_sentance_2' :'',
                   'zh_sentance_3' :'',
                   'eng_sentance_3' :'',
                   'zh_sentance_4' :'',
                   'eng_sentance_4' :''}
    return pd.Series(sentance_dict)

if __name__ == '__main__':

  ''' This is an example scraper for purple culture'''
  hsk_initial='HSK_3.xlsx'

  series = []
  for x in tqdm(pd.read_excel(hsk_initial).Simplified):
    series.append(get_example_sentances(x))

  df=pd.DataFrame(columns=list(series[0].index))

  for l,x in enumerate(pd.read_excel('HSK_3.xlsx').Simplified):
      df.loc[x]=series[l]

  df1 = pd.read_excel('HSK_3.xlsx')[['Simplified', 'Traditional', 'PY', 'ENG']]
  df2 = df.reset_index().rename(columns={'index': 'Simplified'})
  merged_df = pd.merge(df1, df2, on='Simplified', how='outer').set_index('Simplified')

  merged_df.to_csv('hsk3_examples.csv')

  with open('hsk3.json', 'w', encoding='utf-8') as file:
    merged_df.to_json(file, force_ascii=False)
