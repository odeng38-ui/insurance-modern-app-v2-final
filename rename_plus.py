import os
D = 'public/images/cards'
def rename():
    folders = [f for f in os.listdir(D) if os.path.isdir(os.path.join(D, f))]
    count = 0
    for f in folders:
        if '+' in f:
            old = os.path.join(D, f)
            new = os.path.join(D, f.replace('+', ' ').strip())
            # If new folder already exists, move contents and delete old
            if os.path.exists(new) and old != new:
                for item in os.listdir(old):
                    os.rename(os.path.join(old, item), os.path.join(new, item))
                os.rmdir(old)
            else:
                os.rename(old, new)
            count += 1
    print(f'Successfully renamed {count} folders from + to space.')
rename()
