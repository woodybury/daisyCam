from xml.etree import ElementTree
import os

def edit_xml_file(data):
    e = ElementTree.fromstring(data)

    folder = e.find('folder')
    folder.text = 'images'

    file_name = e.find('filename')
    basset_name = file_name.text
    daisy_name = basset_name.replace("basset_hound","daisy")
    file_name.text = daisy_name

    source = e.find('source')
    if source is not None:
        e.remove(source)

    object = e.find('object')

    name = object.find('name')
    name.text = 'daisy'

    pose = object.find('pose')
    pose.text = 'Unspecified'

    occluded = object.find('occluded')
    if occluded is not None:
        object.remove(occluded)

    difficult = object.find('difficult')
    if difficult is not None:
        object.remove(difficult)

    xmlstr = ElementTree.tostring(e)
    return xmlstr


def main():

    source_directory = os.getcwd() + '/annotations'

    for filename in os.listdir(source_directory):

        if not filename.endswith('.xml'):
            continue

        xml_file_path = os.path.join(source_directory, filename)
        with open(xml_file_path, 'r+b') as f:
            data = f.read()
            fixed_data = edit_xml_file(data)
            f.seek(0)
            f.write(fixed_data)
            f.truncate()


if __name__ == '__main__':
    main()