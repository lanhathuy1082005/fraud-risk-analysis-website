

def update_average(old_average, new_value, count):
    return (old_average * (count - 1) + new_value) / count, count + 1